# Blockchain developer bootcamp final project 2021

### A platform for issuing certifications and badges
The main idea is to build a platform that is able to issue courses certifications and skill badges based on NFTs; a solution for recognizing skills, capabilities, and achievements.

### Functions

**educators only functions**

- register a new badge/cert/course (only an educator)
- approve students in a course

**students only functions**

- subscribe to a badge/cert/course
- redeem a badge/cert

**public functions**

- view a issued badege/cert details

### References
https://info.credly.com/about-us

### Proposed Structures 

courses = mapping [uint] => course struct

students = mapping [address] => array [course struct]

