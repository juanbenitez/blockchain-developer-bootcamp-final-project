const Certification = artifacts.require("Certification");

const adminAddress      = ""; // admin
const authorizedAddress = ""; // new authorized tutor

module.exports = async function(done) {
    instance = await Certification.deployed();
    await instance.registerTutor(authorizedAddress, {from: adminAddress});
    done();
}