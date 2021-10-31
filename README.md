# Blockchain developer bootcamp final project 2021

### A platform for issuing certifications and badges
The main idea is to build a platform that is able to issue courses certifications and skill badges based on NFTs; a solution for recognizing skills, capabilities, and achievements.

### Implementation

Each course/badge will be an NFT so students could redeem them individually.

- each course will have its own badge image
- course details
  - id
  - name
  - type
  - is enable
  - image
  - a students collection
  - a educators collection

Would be possible to implement a **Factory pattern** to create multiple instances of courses?

### Functions

**owner only functions**

- create a new badge/cert/course 

**educators only functions**

- enable/disable a course

**students only functions**

- register in a course
- redeem a badge/cert
  - if badge/cert is enable
  - if student is registered in the course

**public functions**

- verify if a student have a course badge

### References
https://info.credly.com/about-us

### Proposed Structures 

courses = mapping [uint] => course struct

students = mapping [address] => array [course struct]

