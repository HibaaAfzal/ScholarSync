import { db } from '../src/lib/db'

async function main() {
  // Wipe existing data
  await db.userScholarshipStatus.deleteMany()
  await db.message.deleteMany()
  await db.scholarship.deleteMany()
  await db.user.deleteMany()

  // ---- Admin ----
  const admin = await db.user.create({
    data: {
      email: 'admin@scholarsync.edu',
      password: 'admin123',
      name: 'Admin User',
      role: 'ADMIN',
    },
  })

  // ---- Students ----
  const student1 = await db.user.create({
    data: {
      email: 'hiba@scholarsync.edu',
      password: 'student123',
      name: 'Hiba Afzal',
      role: 'STUDENT',
    },
  })
  const student2 = await db.user.create({
    data: {
      email: 'bisma@scholarsync.edu',
      password: 'student123',
      name: 'Bisma Ellahi',
      role: 'STUDENT',
    },
  })

  // ---- Teachers ----
  const teacher1 = await db.user.create({
    data: {
      email: 'aleena@hitms.edu.pk',
      password: 'teacher123',
      name: 'Miss Aleena',
      role: 'TEACHER',
      subject: 'Software Engineering',
      phone: '+92-22-920-1100',
      officeHours: 'Mon–Wed, 10:00–12:00, Room 204',
      bio: 'Course instructor for Software Engineering CCP. Guides students on academic projects, documentation, and software process.',
      avatarUrl: '',
    },
  })
  const teacher2 = await db.user.create({
    data: {
      email: 'khan@hitms.edu.pk',
      password: 'teacher123',
      name: 'Dr. Sana Khan',
      role: 'TEACHER',
      subject: 'Computer Science & Algorithms',
      phone: '+92-22-920-1135',
      officeHours: 'Tue–Thu, 13:00–15:00, Room 312',
      bio: 'Specialises in algorithms and competitive programming. Writes recommendation letters for top-performing students.',
      avatarUrl: '',
    },
  })
  const teacher3 = await db.user.create({
    data: {
      email: 'rashid@hitms.edu.pk',
      password: 'teacher123',
      name: 'Mr. Tariq Rashid',
      role: 'TEACHER',
      subject: 'Database & Web Development',
      phone: '+92-22-920-1188',
      officeHours: 'Mon–Fri, 09:00–10:30, Lab 2',
      bio: 'Industry-experienced faculty. Mentors final-year projects and reviews scholarship CVs.',
      avatarUrl: '',
    },
  })

  // ---- Scholarships ----
  const scholarships = [
    {
      title: 'HEC Undergraduate Scholarship',
      provider: 'Higher Education Commission (HEC) Pakistan',
      country: 'Pakistan',
      degreeLevel: 'Undergraduate',
      fundingType: 'Fully Funded',
      deadline: '2026-03-15',
      applicationUrl: 'https://hec.gov.pk',
      description:
        'A need-cum-merit based scholarship for undergraduate students enrolled in selected public-sector universities of Pakistan. Covers tuition fee, living allowance, and book allowance. Eligible applicants must be Pakistani/AJK nationals, enrolled full-time, with a secured admission at an HEC-recognised institution and a household income below the defined threshold.',
    },
    {
      title: 'DAAD Study Scholarship',
      provider: 'Deutscher Akademischer Austauschdienst (DAAD)',
      country: 'Germany',
      degreeLevel: 'Master',
      fundingType: 'Fully Funded',
      deadline: '2026-10-31',
      applicationUrl: 'https://www.daad.de',
      description:
        'DAAD Study Scholarship supports international graduates holding a Bachelor degree who wish to pursue a full Master programme at a German university. The scholarship covers a monthly stipend, travel allowance, health and accident insurance, and a one-time study allowance.',
    },
    {
      title: 'Erasmus+ Master Loan',
      provider: 'European Union Erasmus+',
      country: 'European Union',
      degreeLevel: 'Master',
      fundingType: 'Partial / Loan',
      deadline: '2026-06-30',
      applicationUrl: 'https://erasmus-plus.ec.europa.eu',
      description:
        'Erasmus+ Master Loan provides favourable loans to international students accepted into a full Master programme in an Erasmus+ programme country. Designed to cover living and tuition costs for up to two years.',
    },
    {
      title: 'Commonwealth Master’s Scholarship',
      provider: 'Commonwealth Scholarship Commission (UK)',
      country: 'United Kingdom',
      degreeLevel: 'Master',
      fundingType: 'Fully Funded',
      deadline: '2026-10-21',
      applicationUrl: 'https://cscuk.fcdo.gov.uk',
      description:
        'Fully funded Master’s scholarship for students from Commonwealth countries who would not otherwise be able to afford to study in the UK. Covers tuition fees, return airfare, monthly stipend, thesis grant, and warm clothing allowance.',
    },
    {
      title: 'Stipendium Hungaricum',
      provider: 'Government of Hungary',
      country: 'Hungary',
      degreeLevel: 'Bachelor / Master / PhD',
      fundingType: 'Fully Funded',
      deadline: '2026-01-15',
      applicationUrl: 'https://stipendiumhungaricum.hu',
      description:
        'Stipendium Hungaricum is a bilateral programme offering fully funded study opportunities for international students in Hungary. Covers tuition, accommodation, medical insurance, and a monthly stipend.',
    },
    {
      title: 'Turkey Burslari (Türkiye Scholarships)',
      provider: 'Government of Türkiye',
      country: 'Türkiye',
      degreeLevel: 'Bachelor / Master / PhD',
      fundingType: 'Fully Funded',
      deadline: '2026-02-20',
      applicationUrl: 'https://www.turkiyeburslari.gov.tr',
      description:
        'Türkiye Scholarships are government-funded, competitive scholarships for international students. Include tuition, accommodation, monthly stipend, Turkish language course, and round-trip flight.',
    },
    {
      title: 'Aga Khan Foundation International Scholarship',
      provider: 'Aga Khan Foundation',
      country: 'International',
      degreeLevel: 'Master',
      fundingType: 'Partial / Loan',
      deadline: '2026-04-30',
      applicationUrl: 'https://the.akdn',
      description:
        'A 50% grant / 50% loan programme for outstanding postgraduate students from selected developing countries who have no other means of financing their studies.',
    },
    {
      title: 'Chevening Scholarship (UK)',
      provider: 'UK Government (FCDO)',
      country: 'United Kingdom',
      degreeLevel: 'Master',
      fundingType: 'Fully Funded',
      deadline: '2026-11-05',
      applicationUrl: 'https://www.chevening.org',
      description:
        'Chevening is the UK government’s international scholarships programme offering future leaders the opportunity to study a one-year Master’s degree in the UK. Covers tuition, monthly living allowance, return airfare, and additional grants.',
    },
    {
      title: 'Islamic Development Bank Scholarship',
      provider: 'IsDB',
      country: 'International',
      degreeLevel: 'Bachelor / Master / PhD',
      fundingType: 'Fully Funded',
      deadline: '2026-03-31',
      applicationUrl: 'https://www.isdb.org',
      description:
        'The IsDB Scholarship Programme offers fully funded opportunities for students from IsDB member countries and Muslim communities in non-member countries to study at undergraduate, master, and PhD levels.',
    },
    {
      title: 'United Nations SDG Scholarships',
      provider: 'UNDP',
      country: 'International',
      degreeLevel: 'Master',
      fundingType: 'Partial',
      deadline: '2026-05-15',
      applicationUrl: 'https://www.undp.org',
      description:
        'A partial scholarship supporting students whose Master’s research aligns directly with one or more of the UN Sustainable Development Goals. Covers a portion of tuition and a stipend.',
    },
    {
      title: 'Gates Cambridge Scholarship',
      provider: 'Bill & Melinda Gates Foundation',
      country: 'United Kingdom',
      degreeLevel: 'PhD / Master',
      fundingType: 'Fully Funded',
      deadline: '2026-12-03',
      applicationUrl: 'https://www.gatescambridge.org',
      description:
        'Gates Cambridge Scholarship funds outstanding applicants from outside the UK to pursue a full-time postgraduate degree at the University of Cambridge. Covers full cost of studying, plus discretionary allowances.',
    },
    {
      title: 'MEXT Scholarship (Japan)',
      provider: 'Ministry of Education, Japan',
      country: 'Japan',
      degreeLevel: 'Bachelor / Master / PhD',
      fundingType: 'Fully Funded',
      deadline: '2026-05-09',
      applicationUrl: 'https://www.studyinjapan.go.jp',
      description:
        'The MEXT Scholarship offered by the Japanese Government covers tuition, monthly stipend, and round-trip airfare for international students pursuing undergraduate, master, or PhD studies in Japan.',
    },
  ]

  for (const s of scholarships) {
    await db.scholarship.create({
      data: { ...s, createdById: admin.id },
    })
  }

  // Sample tracking for student1
  const all = await db.scholarship.findMany()
  if (all[0]) {
    await db.userScholarshipStatus.create({
      data: { userId: student1.id, scholarshipId: all[0].id, status: 'SAVED' },
    })
  }
  if (all[1]) {
    await db.userScholarshipStatus.create({
      data: { userId: student1.id, scholarshipId: all[1].id, status: 'APPLIED' },
    })
  }
  if (all[2]) {
    await db.userScholarshipStatus.create({
      data: { userId: student1.id, scholarshipId: all[2].id, status: 'INTERESTED' },
    })
  }

  // Sample message from student1 to teacher1
  await db.message.create({
    data: {
      fromUserId: student1.id,
      toUserId: teacher1.id,
      subject: 'Request for Recommendation Letter',
      content:
        'Respected Miss Aleena, I am applying for the DAAD Study Scholarship and would be honoured if you could provide a recommendation letter based on my performance in your Software Engineering course. I can share my CV and transcripts at your convenience.',
      messageType: 'RECOMMENDATION_REQUEST',
      status: 'SENT',
    },
  })

  console.log('Seed complete.')
  console.log('Admin   : admin@scholarsync.edu / admin123')
  console.log('Students: hiba@scholarsync.edu / student123 , bisma@scholarsync.edu / student123')
  console.log('Teachers: aleena@hitms.edu.pk / teacher123 , khan@hitms.edu.pk / teacher123 , rashid@hitms.edu.pk / teacher123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
