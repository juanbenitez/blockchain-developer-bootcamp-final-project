const { expect, assert } = require('chai');
// Import utilities from Test Helpers
const { BN, expectEvent, expectRevert } = require('@openzeppelin/test-helpers');
const Certification = artifacts.require("Certification");

const Status = {
  DRAFT: 0,
  PUBLISHED: 1,
  CLOSED: 2,
};

const TUTOR_ROLE = web3.utils.soliditySha3('TUTOR');
const STUDENT_ROLE = web3.utils.soliditySha3('STUDENT');

/*
 * uncomment accounts to access the test accounts made available by the
 * Ethereum client
 * See docs: https://www.trufflesuite.com/docs/truffle/testing/writing-tests-in-javascript
 */
contract("Certification", function (accounts) {
  
  let instance; 
  const [tutorAddress, studentAddress, someoneAddress] = accounts;
  let initCert = null;

  beforeEach(async () => {
    instance = await Certification.deployed();

    let certificate = {
      courseName: 'initial certificate',
      tutor: tutorAddress,
      validDays: 365,
    };

    let result = await instance.createCertificate(
      certificate.courseName,
      certificate.tutor,
      certificate.validDays
    );

    //console.log(result.logs[0].args.certificateId.toString());
    initCertId = result.logs[0].args.certificateId;
    initCert = await instance.certificates(initCertId);
    return;
    /*console.log('Cert ID:' + initCert.id.toNumber());
    console.log('Cert title:' + initCert.title);
    console.log('Cert tutor:' + initCert.issuedBy);
    console.log('Cert timestamp:' + initCert.issuedDate);
    console.log('Cert valid:' + initCert.validDays);
    console.log('Cert status:' + initCert.status); */
  });

  /**
  * =========  CERTIFICATE tests ================
  */
   context('CERTIFICATE tests', async () => {

    it("should create a new certificate", async function () {
      
      let prevCertsQty = await instance.certificatesCreated();

      let certificate = {
        title: 'test certificate 1',
        tutor: tutorAddress,
        validDays: 365,
      };

      let result = await instance.createCertificate(
        certificate.title,
        certificate.tutor,
        certificate.validDays
      );
    
      const createdCertId = result.logs[0].args.certificateId;
      createdCert = await instance.certificates(createdCertId);
      
      let updatedCertsQty = await instance.certificatesCreated();
      //console.log(updatedCertsQty);

      expect(createdCert.id).to.be.bignumber.equal(createdCertId);
      assert.equal(createdCert.title, 'test certificate 1');
      assert.equal(createdCert.validDays, 365); //Draft
      assert.equal(createdCert.status, 0); //Draft

      assert.equal(updatedCertsQty.toNumber(), prevCertsQty.toNumber() + 1);
    });

    it("should create a certificate only if role is TUTOR", async function () {
      
      let certificate = {
        courseName: 'test course1',
        tutor: tutorAddress,
        validDays: 365,
      };

      await expectRevert.unspecified(
        instance.createCertificate(
          certificate.courseName,
          certificate.tutor,
          certificate.validDays,
          {from: someoneAddress}
        )
      );
      
    });

    it("should publish a certificate", async function () {
      
      await instance.publishCertificate(initCert.id, {from:tutorAddress});
      
      cert = await instance.certificates(initCert.id);

      assert.equal(cert.status, Status.PUBLISHED);
    });

    it("should close a certificate", async function () {
      
      await instance.closeCertificate(initCert.id, {from:tutorAddress});
      
      cert = await instance.certificates(initCert.id);

      assert.equal(cert.status, Status.CLOSED);
    });
  });

  /**
  * =========  FETCH tests ================
  */
  context('FETCH certificates tests', async () => {
    
    it("should fetch certificates owned by user", async function () {
      
      //publish certificate
      await instance.publishCertificate(initCert.id, {from:tutorAddress});

      // user mint the certificate NFT
      await instance.mintCertificateNFT(initCert.id, {from: tutorAddress});

      const {0: certificates, 1: tokens} = await instance.getCertificatesByHolder(tutorAddress);
      //console.log(certificates);
      //console.log(tokens);

      assert.isArray(certificates);
      assert.isNotEmpty(certificates);
      assert.equal(certificates.length, 1);
      assert.isArray(tokens);
      assert.isNotEmpty(tokens);
      assert.equal(tokens.length, 1);
    });

  });

  /**
  * =========  ADMIN tests ================
  */
    context('ADMIN tests', async () => {
    
      it("should grant tutor role", async function () {
        let adminAddress = tutorAddress;

        await expectEvent(
          await instance.registerTutor(someoneAddress, {from: adminAddress}),
          'RoleGranted',
          {
            role: TUTOR_ROLE, 
            account: someoneAddress,
            sender: adminAddress
          }
        );
      });
    });

  /**
  * =========  NFT tests ================
  */
  context('NFT tests', async () => {
    
    it("should mint a new NFT certificate", async function () {
      
      //publish certificate
      await instance.publishCertificate(initCert.id, {from:tutorAddress});

      //console.log(studentAddress);
      // student mint the certificate NFT
      let result = await instance.mintCertificateNFT(initCert.id, {from: studentAddress});
      //console.log(result.logs[0].args.tokenId.toString());
      let tokenMintedId = result.logs[0].args.tokenId;

      let ownerAddress = await instance.ownerOf(tokenMintedId);
      //console.log(ownerAddress.toString());
      let tokenId = await instance.certificatesHolders(studentAddress, initCert.id);

      let isOwner = await instance.verifyCertificateHolder(studentAddress, initCert.id);

      assert.isTrue(isOwner);
      assert.equal(ownerAddress, studentAddress);
      expect(tokenMintedId).to.be.bignumber.equal(tokenId);

    });

    it("should not allow to mint a NFT for invalid/inexistent certificate", async function () {
      
      const invalidCertId = 1000;
  
      await expectRevert(
        instance.mintCertificateNFT(invalidCertId, {from: studentAddress}),
        'Certificate not valid'
      );
    });

    it("should not allow to mint a NFT certificate if is not published", async function () {
      
      await expectRevert(
        instance.mintCertificateNFT(initCert.id, {from: studentAddress}),
        'Certificate is not published'
      );
    });

    it("should not allow to mint same certificate twice", async function () {
      
      //publish certificate
      await instance.publishCertificate(initCert.id, {from:tutorAddress});

      //first mint
      instance.mintCertificateNFT(initCert.id, {from: studentAddress});
      //anohter mint for the same certificate
      await expectRevert(
        instance.mintCertificateNFT(initCert.id, {from: studentAddress}),
        'Can not mint the certificate twice'
      );
    });

    it("should verificate a student as owner of a NFT certificate", async function () {
      
      //publish certificate
      await instance.publishCertificate(initCert.id, {from:tutorAddress});
      
      // student mint the certificate NFT
      await instance.mintCertificateNFT(initCert.id, {from: studentAddress});

      let studentIsOwner = await instance.verifyCertificateHolder(studentAddress, initCert.id);
      
      assert.isTrue(studentIsOwner);
    });

    it("should not verificate if the student do not own a NFT certificate", async function () {
      
      let someoneIsNotOwner = await instance.verifyCertificateHolder(someoneAddress, initCert.id);
      
      assert.isFalse(someoneIsNotOwner);
    });

  });

}); // end of tests
