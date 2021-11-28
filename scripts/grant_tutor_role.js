const Certification = artifacts.require("Certification");

const adminAddress      = "0x07baeE508122DDdd383F0F69A2fb23a3A5Bf587b"; // admin
const authorizedAddress = "0x9073035242621ce403a60a4659d7a267257349ab"; // new authorized tutor

module.exports = async function(done) {
    instance = await Certification.deployed();
    await instance.registerTutor(authorizedAddress, {from: adminAddress});
    done();
}