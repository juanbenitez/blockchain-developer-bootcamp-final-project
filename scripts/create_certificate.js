const Certification = artifacts.require("Certification");

const tutorAddress = "a tutor address"; // tutor

module.exports = async function(done) {
    instance = await Certification.deployed();
    await instance.registerTutor({from: tutorAddress});
    
    let certificate = {
        title: 'initial test certificate',
        tutor: tutorAddress,
        validDays: 365,
    };

    let result = await instance.createCertificate(
        certificate.title,
        certificate.tutor,
        certificate.validDays
    );
      
    console.log(result)
    console.log(instance.address)
    done();
}