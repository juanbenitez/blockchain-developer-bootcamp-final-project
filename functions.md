## Contract Functions

**Educators functions**

function toggleCourseStatus(uint courseId, bool status){

​	//enable or disable a course

}

**Students functions**

modifier courseIsEnable(uint courseId){
	// check if the course is enabled
}

modifier studentIsRegistered(uint courseId, address student){
	// check if the student is registered in the course
}

function registerForCourse(uint courseId, address student){ 
	// register the student in a course
}

redeemCourseBadge(uint courseId, address student){
	//deliver the badge NFT of a course
}

**public functions**

verifyCourse(uint course, address student) returns (bool) {

}