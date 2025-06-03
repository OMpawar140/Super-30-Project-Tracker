const { PrismaClient, Role, EnrollmentStatus, TestProgressStatus } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log("🚀 Seeding Database...");

  // Insert 10 Schools
  const schools = [];
  for (let i = 1; i <= 10; i++) {
    schools.push(await prisma.school.create({
      data: { name: `School ${i}` }
    }));
  }

  // Insert 10 Semesters
  const semesters = [];
  for (let i = 1; i <= 10; i++) {
    semesters.push(await prisma.semester.create({
      data: { name: `Semester ${i}` }
    }));
  }

  // Insert 10 Users (3 Admins, 3 Teachers, 4 Students)
  const users = [];
  for (let i = 1; i <= 10; i++) {
    const role = i <= 3 ? Role.ADMIN : i <= 6 ? Role.TEACHER : Role.STUDENT;
    users.push(await prisma.user.create({
      data: {
        name: `User ${i}`,
        email: `user${i}@example.com`,
        passwordHash: `hashedpassword${i}`,
        role,
        schoolId: schools[i % schools.length].id
      }
    }));
  }

  // Insert 10 Courses
  const courses = [];
  for (let i = 1; i <= 10; i++) {
    courses.push(await prisma.course.create({
      data: {
        name: `Course ${i}`,
        description: `Description for Course ${i}`,
        teacherId: users[(i % 3) + 3].id, // Assign to teachers
        schoolId: schools[i % schools.length].id,
        semesterId: semesters[i % semesters.length].id
      }
    }));
  }

  // Insert 10 Chapters
  const chapters = [];
  for (let i = 1; i <= 10; i++) {
    chapters.push(await prisma.chapter.create({
      data: {
        name: `Chapter ${i}`,
        courseId: courses[i % courses.length].id
      }
    }));
  }

  // Insert 10 Topics
  for (let i = 1; i <= 10; i++) {
    await prisma.topic.create({
      data: {
        name: `Topic ${i}`,
        chapterId: chapters[i % chapters.length].id
      }
    });
  }

  // Insert 10 Enrollments
  for (let i = 1; i <= 10; i++) {
    await prisma.enrollment.create({
      data: {
        studentId: users[(i % 4) + 6].id, // Assign to students
        courseId: courses[i % courses.length].id,
        status: EnrollmentStatus.ENROLLED
      }
    });
  }

  // Insert 10 Tests
  const tests = [];
  for (let i = 1; i <= 10; i++) {
    tests.push(await prisma.test.create({
      data: {
        name: `Test ${i}`,
        totalMarks: 100,
        courseId: courses[i % courses.length].id,
        teacherId: users[(i % 3) + 3].id
      }
    }));
  }

  // Insert 10 Questions
  const questions = [];
  for (let i = 1; i <= 10; i++) {
    questions.push(await prisma.question.create({
      data: {
        text: `Question ${i}`,
        level: Math.floor(Math.random() * 6) + 1,
        courseId: courses[i % courses.length].id,
        teacherId: users[(i % 3) + 3].id
      }
    }));
  }

  // Insert 10 TestQuestions
  for (let i = 1; i <= 10; i++) {
    await prisma.testQuestion.create({
      data: {
        testId: tests[i % tests.length].id,
        questionId: questions[i % questions.length].id
      }
    });
  }

  // Insert 10 TestStatuses
  for (let i = 1; i <= 10; i++) {
    await prisma.testStatus.create({
      data: {
        studentId: users[(i % 4) + 6].id,
        testId: tests[i % tests.length].id,
        status: TestProgressStatus.NOT_STARTED
      }
    });
  }

  // Insert 10 TestSubmissions
  for (let i = 1; i <= 10; i++) {
    await prisma.testSubmission.create({
      data: {
        studentId: users[(i % 4) + 6].id,
        testId: tests[i % tests.length].id,
        questionId: questions[i % questions.length].id,
        answer: `Answer for question ${i}`,
        marksObtained: Math.floor(Math.random() * 100)
      }
    });
  }

  console.log("✅ Seeding Complete!");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
