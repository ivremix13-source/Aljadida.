/*
 * ملف بيانات مدرسة الجديدة النموذجية بنين
 * ------------------------------------------------------------------
 * لإضافة ملف دراسي، افتح بيانات المادة وأضف عنصرًا إلى books أو
 * worksheets أو exams بالشكل التالي:
 * { name: "اسم الملف", url: "files/example.pdf", download: true }
 * استخدم رابطًا محليًا داخل المشروع مثل files/example.pdf أو رابط https موثوق.
 * لا تتم إضافة ملفات وهمية؛ القوائم تبدأ فارغة حتى تضيف ملفاتك الفعلية.
 */
const schoolConfig = {
  schoolName: "مدرسة الجديدة النموذجية بنين",

  // تاريخ مبدئي قابل للتعديل. لا يُعد إعلانًا رسميًا عن موعد الامتحانات.
  examTargetDate: "2027-04-24T08:00:00+02:00",
  examDateLabel: "24 أبريل 2027",

  plannerSubjects: [
    { id: "arabic", label: "اللغة العربية" },
    { id: "english", label: "اللغة الإنجليزية" },
    { id: "islamic", label: "الدراسات الإسلامية" },
    { id: "math", label: "الرياضيات" },
    { id: "specialized-math", label: "الرياضيات المتخصصة" },
    { id: "physics", label: "الفيزياء" },
    { id: "chemistry", label: "الكيمياء" },
    { id: "biology", label: "الأحياء" }
  ],

  streams: [
    {
      id: "engineering",
      title: "مسار علمي هندسية",
      shortTitle: "علمي هندسية",
      description: "الرياضيات المتخصصة والفيزياء والكيمياء والمواد المساندة.",
      icon: "fa-calculator",
      href: "stream-engineering.html"
    },
    {
      id: "biology",
      title: "مسار علمي أحياء",
      shortTitle: "علمي أحياء",
      description: "الأحياء والفيزياء والكيمياء والمواد العلمية المساندة.",
      icon: "fa-dna",
      href: "stream-biology.html"
    },
    {
      id: "computer",
      title: "مسار علمي حاسوب",
      shortTitle: "علمي حاسوب",
      description: "علوم الحاسوب والرياضيات والعلوم الأساسية المرتبطة بها.",
      icon: "fa-laptop-code",
      href: "stream-cs.html"
    },
    {
      id: "arts",
      title: "المسار الأدبي",
      shortTitle: "المسار الأدبي",
      description: "التاريخ والجغرافيا واللغة والمواد الإنسانية والأدبية.",
      icon: "fa-book-open-reader",
      href: "stream-arts.html"
    }
  ],

  // أضف رابط الملف الحقيقي داخل المصفوفة المناسبة لكل مادة.
  subjectsData: {
    engineering: [
      { id: "eng-specialized-math", subjectName: "الرياضيات المتخصصة", icon: "fa-square-root-variable", books: [], worksheets: [], exams: [] },
      { id: "eng-physics", subjectName: "الفيزياء", icon: "fa-atom", books: [], worksheets: [], exams: [] },
      { id: "eng-chemistry", subjectName: "الكيمياء", icon: "fa-flask", books: [], worksheets: [], exams: [] },
      { id: "eng-arabic", subjectName: "اللغة العربية", icon: "fa-language", books: [], worksheets: [], exams: [] },
      { id: "eng-english", subjectName: "اللغة الإنجليزية", icon: "fa-earth-africa", books: [], worksheets: [], exams: [] },
      { id: "eng-islamic", subjectName: "الدراسات الإسلامية", icon: "fa-moon", books: [], worksheets: [], exams: [] }
    ],

    biology: [
      { id: "bio-biology", subjectName: "الأحياء", icon: "fa-dna", books: [], worksheets: [], exams: [] },
      { id: "bio-physics", subjectName: "الفيزياء", icon: "fa-atom", books: [], worksheets: [], exams: [] },
      { id: "bio-chemistry", subjectName: "الكيمياء", icon: "fa-flask", books: [], worksheets: [], exams: [] },
      { id: "bio-mathematics", subjectName: "الرياضيات الأساسية", icon: "fa-calculator", books: [], worksheets: [], exams: [] },
      { id: "bio-arabic", subjectName: "اللغة العربية", icon: "fa-language", books: [], worksheets: [], exams: [] },
      { id: "bio-english", subjectName: "اللغة الإنجليزية", icon: "fa-earth-africa", books: [], worksheets: [], exams: [] },
      { id: "bio-islamic", subjectName: "الدراسات الإسلامية", icon: "fa-moon", books: [], worksheets: [], exams: [] }
    ],

    computer: [
      { id: "cs-computer", subjectName: "علوم الحاسوب", icon: "fa-laptop-code", books: [], worksheets: [], exams: [] },
      { id: "cs-specialized-math", subjectName: "الرياضيات المتخصصة", icon: "fa-square-root-variable", books: [], worksheets: [], exams: [] },
      { id: "cs-physics", subjectName: "الفيزياء", icon: "fa-atom", books: [], worksheets: [], exams: [] },
      { id: "cs-chemistry", subjectName: "الكيمياء", icon: "fa-flask", books: [], worksheets: [], exams: [] },
      { id: "cs-arabic", subjectName: "اللغة العربية", icon: "fa-language", books: [], worksheets: [], exams: [] },
      { id: "cs-english", subjectName: "اللغة الإنجليزية", icon: "fa-earth-africa", books: [], worksheets: [], exams: [] },
      { id: "cs-islamic", subjectName: "الدراسات الإسلامية", icon: "fa-moon", books: [], worksheets: [], exams: [] }
    ],

    arts: [
      { id: "arts-history", subjectName: "التاريخ", icon: "fa-landmark", books: [], worksheets: [], exams: [] },
      { id: "arts-geography", subjectName: "الجغرافيا", icon: "fa-earth-africa", books: [], worksheets: [], exams: [] },
      { id: "arts-arabic", subjectName: "اللغة العربية", icon: "fa-language", books: [], worksheets: [], exams: [] },
      { id: "arts-english", subjectName: "اللغة الإنجليزية", icon: "fa-book-open", books: [], worksheets: [], exams: [] },
      { id: "arts-islamic", subjectName: "الدراسات الإسلامية", icon: "fa-moon", books: [], worksheets: [], exams: [] },
      { id: "arts-humanities", subjectName: "المواد الأدبية والإنسانية", icon: "fa-book-open-reader", books: [], worksheets: [], exams: [] }
    ]
  }
};
