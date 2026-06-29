"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type Locale = "fr" | "ar";

type Messages = {
  nav: {
    home: string;
    subjects: string;
    placement: string;
    lessons: string;
    signIn: string;
    getStarted: string;
    signOut: string;
    adminSubjects: string;
    adminLessons: string;
    adminPlacement: string;
  };
  brand: string;
  brandTagline: string;
  switchLabel: string;
  home: {
    eyebrow: string;
    title: string;
    lead: string;
    createAccount: string;
    signIn: string;
    browseSubjects: string;
    heroBadge: string;
    heroScore: string;
    heroSteps: [string, string, string];
    builtFor: string;
    builtTitle: string;
    builtCards: [string, string, string];
    teacherEyebrow: string;
    teacherTitle: string;
    teacherCopy: string;
    whatFeelsBetter: string;
    betterItems: [string, string, string];
  };
  auth: {
    loginEyebrow: string;
    signupEyebrow: string;
    loginTitle: string;
    signupTitle: string;
    loginCopy: string;
    signupCopy: string;
    loginHero: [string, string, string];
    signupHero: [string, string, string];
    loginIntroEyebrow: string;
    signupIntroEyebrow: string;
    loginIntroTitle: string;
    signupIntroTitle: string;
    loginIntroCopy: string;
    signupIntroCopy: string;
    username: string;
    password: string;
    newHere: string;
    alreadyHave: string;
    switchToSignup: string;
    switchToLogin: string;
    securePortal: string;
    joinClassroom: string;
    backHome: string;
  };
  common: {
    loading: string;
    loadingSession: string;
    redirecting: string;
    restoring: string;
    openingDashboard: string;
    preparingClassroom: string;
    loadingSubjects: string;
    loadingSubjectList: string;
    loadingLesson: string;
    loadingLessons: string;
    loadingPlacement: string;
    loadingPlacementTests: string;
    checkingSession: string;
    submitting: string;
    saving: string;
    refresh: string;
    backToHome: string;
    backToLessons: string;
    continue: string;
    nextLesson: string;
    previousLesson: string;
    backToLessonList: string;
    home: string;
    completed: string;
    totalLessons: string;
    questions: string;
    completedLabel: string;
    unlockedLabel: string;
    lockedLabel: string;
    watchVideo: string;
    watchVideoOnYouTube: string;
    copyright: string;
    allRightsReserved: string;
    lessonNotFound: string;
    returnToList: string;
    greatWork: string;
    unlockedNextLesson: string;
    completedSubject: string;
    continueWhileFresh: string;
    headBackOrReview: string;
    openLesson: string;
    noSubjects: string;
    noLessons: string;
    noPlacementTests: string;
    placementReady: string;
    placementComplete: string;
    placementRequired: string;
    answerEveryQuestion: string;
    lessonPath: string;
    chooseSubject: string;
  };
  landing: {
    steps: [string, string, string];
    highlightLabels: [string, string, string];
    highlightValues: [string, string, string];
  };
  subjects: {
    title: string;
    lead: string;
    placedBanner: string;
    openLessons: string;
  };
  lessonIndex: {
    title: string;
    lead: string;
    progressLabel: string;
    continueLabel: string;
    reviewNextLabel: string;
    lessonPrefix: string;
    openLessonCopy: string;
  };
  lessonDetail: {
    title: string;
    lead: string;
    lessonPrefix: string;
    passToUnlock: string;
  };
  placement: {
    title: string;
    lead: string;
    submitAssessment: string;
    noPlacementTests: string;
    submitPlacementTest: string;
    passSummary: string;
  };
  admin: {
    title: string;
    lead: string;
    subjects: string;
    lessons: string;
    placement: string;
    createSubject: string;
    subjectName: string;
    addSubject: string;
    createLesson: string;
    addLesson: string;
    addQuizQuestion: string;
    lessonTitle: string;
    lessonDescription: string;
    youtubeUrl: string;
    order: string;
    passPercent: string;
    chooseSubject: string;
    chooseLesson: string;
    addPlacementTest: string;
    addAnotherQuestion: string;
    createPlacementTest: string;
    placementQuestion: string;
    optionsSeparated: string;
    correctAnswerText: string;
    tests: string;
    refresh: string;
    delete: string;
    loading: string;
  };
  status: {
    completed: string;
    unlocked: string;
    locked: string;
  };
  role: {
    admin: string;
    student: string;
  };
};

const messages: Record<Locale, Messages> = {
  fr: {
    nav: {
      home: "Accueil",
      subjects: "Matières",
      placement: "Placement",
      lessons: "Leçons",
      signIn: "Se connecter",
      getStarted: "Commencer",
      signOut: "Se déconnecter",
      adminSubjects: "Matières",
      adminLessons: "Leçons",
      adminPlacement: "Placement",
    },
    brand: "Daam",
    brandTagline: "Apprenez à votre niveau",
    switchLabel: "Langue",
    home: {
      eyebrow: "Daam Education",
      title: "Une plateforme scolaire qui ressemble à un vrai produit, pas à un simple prototype.",
      lead:
        "Tests de placement, parcours de leçons guidées, support vidéo et quiz fonctionnent ensemble pour que les élèves sachent toujours quoi faire ensuite.",
      createAccount: "Créer un compte",
      signIn: "Se connecter",
      browseSubjects: "Voir les matières",
      heroBadge: "Parcours élève",
      heroScore: "Flux prêt à 98 %",
      heroSteps: ["Le placement d'abord", "Les leçons suivent l'ordre", "Les quiz ferment la boucle"],
      builtFor: "Conçu pour l’éducation",
      builtTitle: "Assez simple pour les élèves, assez structuré pour une vraie équipe produit.",
      builtCards: [
        "Les élèves commencent au bon niveau au lieu d’atterrir dans un flux générique.",
        "Chaque matière se débloque dans l’ordre pour garder une progression claire.",
        "Les évaluations courtes renforcent la leçon et montrent ce qui est prêt à avancer.",
      ],
      teacherEyebrow: "Pour les enseignants",
      teacherTitle: "Gérez le parcours sans changer l’expérience élève.",
      teacherCopy:
        "Les pages d’administration restent centrées sur les matières, les leçons, les quiz et les tests de placement tandis que le flux élève reste propre et guidé.",
      whatFeelsBetter: "Ce qui est mieux maintenant",
      betterItems: [
        "Pages distinctes pour la connexion et l’inscription",
        "États de chargement et de quiz plus soignés",
        "Cartes de matières qui mènent à un vrai parcours de leçons",
      ],
    },
    auth: {
      loginEyebrow: "Espace élève",
      signupEyebrow: "Rejoignez Daam",
      loginTitle: "Reprenez exactement là où votre apprentissage s’est arrêté.",
      signupTitle: "Créez un compte et commencez au bon niveau.",
      loginCopy:
        "Connectez-vous pour continuer votre parcours de placement, ouvrir les leçons dans l’ordre et garder tous vos résultats au même endroit.",
      signupCopy:
        "Créez votre compte en quelques secondes, puis passez le test de placement pour démarrer au bon niveau.",
      loginHero: ["Placement d’abord", "Leçons débloquées dans l’ordre", "Quiz pour garder le rythme"],
      signupHero: ["Parcours guidé", "Placement qui fixe le niveau", "Quiz et leçons bien organisés"],
      loginIntroEyebrow: "Portail sécurisé",
      signupIntroEyebrow: "Rejoignez la classe",
      loginIntroTitle: "Se connecter",
      signupIntroTitle: "Créer un compte",
      loginIntroCopy: "Utilisez votre compte pour accéder aux matières et reprendre votre progression.",
      signupIntroCopy: "Créez votre compte, puis passez le test de placement.",
      username: "Nom d’utilisateur",
      password: "Mot de passe",
      newHere: "Nouveau ici ?",
      alreadyHave: "Vous avez déjà un compte ?",
      switchToSignup: "Créer un compte",
      switchToLogin: "Se connecter",
      securePortal: "Portail sécurisé",
      joinClassroom: "Rejoignez la classe",
      backHome: "Retour à l’accueil",
    },
    common: {
      loading: "Chargement",
      loadingSession: "Vérification de la session",
      redirecting: "Redirection",
      restoring: "Restauration de la session",
      openingDashboard: "Ouverture du tableau de bord",
      preparingClassroom: "Préparation de votre espace",
      loadingSubjects: "Chargement de vos matières",
      loadingSubjectList: "Chargement des matières",
      loadingLesson: "Chargement de la leçon",
      loadingLessons: "Chargement des leçons",
      loadingPlacement: "Chargement du test de placement",
      loadingPlacementTests: "Chargement des tests de placement",
      checkingSession: "Vérification de la session",
      submitting: "Envoi…",
      saving: "Enregistrement…",
      refresh: "Actualiser",
      backToHome: "Retour à l’accueil",
      backToLessons: "Retour aux leçons",
      continue: "Continuer",
      nextLesson: "Leçon suivante",
      previousLesson: "Leçon précédente",
      backToLessonList: "Retour à la liste des leçons",
      home: "Accueil",
      completed: "terminé",
      totalLessons: "leçons au total",
      questions: "questions",
      completedLabel: "Terminé",
      unlockedLabel: "Débloqué",
      lockedLabel: "Verrouillé",
      watchVideo: "Voir la vidéo",
      watchVideoOnYouTube: "Regarder sur YouTube",
      copyright: "Daam Éducation",
      allRightsReserved: "Tous droits réservés",
      lessonNotFound: "Leçon introuvable",
      returnToList: "Retourner à la liste",
      greatWork: "Bravo",
      unlockedNextLesson: "Vous avez débloqué la leçon suivante.",
      completedSubject: "Vous avez terminé cette matière.",
      continueWhileFresh: "Continuez maintenant pendant que tout est encore frais.",
      headBackOrReview: "Retournez à la liste des matières ou revoyez les leçons terminées.",
      openLesson: "Ouvrir la leçon",
      noSubjects: "Aucune matière disponible pour le moment.",
      noLessons: "Aucune leçon n’est disponible pour cette matière.",
      noPlacementTests: "Aucun test de placement disponible.",
      placementReady: "Le test de placement est prêt.",
      placementComplete: "Placement terminé",
      placementRequired: "Un test de placement est requis.",
      answerEveryQuestion: "Veuillez répondre à toutes les questions.",
      lessonPath: "Parcours de leçons",
      chooseSubject: "Choisir une matière",
    },
    landing: {
      steps: ["Le placement d’abord", "Les leçons restent ordonnées", "Les quiz ferment la boucle"],
      highlightLabels: ["Parcours structurés", "Retour immédiat", "Contrôle enseignant"],
      highlightValues: [
        "3 niveaux d’apprentissage",
        "Résultats après chaque leçon",
        "Outils d’administration pour les matières et tests",
      ],
    },
    subjects: {
      title: "Choisissez une matière",
      lead: "Chaque matière contient des leçons ordonnées. Terminez les quiz pour débloquer la suite.",
      placedBanner: "Placement terminé - votre parcours d’apprentissage est prêt.",
      openLessons: "Ouvrir les leçons",
    },
    lessonIndex: {
      title: "Parcours de leçons",
      lead:
        "Suivez l’ordre des leçons, terminez les quiz étape par étape et gardez votre progression visible comme dans une vraie plateforme d’apprentissage.",
      progressLabel: "progression",
      continueLabel: "Continuer",
      reviewNextLabel: "Revoir la suite",
      lessonPrefix: "Leçon",
      openLessonCopy: "Ouvrir cette leçon pour voir la vidéo et passer le quiz.",
    },
    lessonDetail: {
      title: "Leçon",
      lead: "Travaillez une leçon à la fois. Réussissez le quiz pour débloquer l’étape suivante.",
      lessonPrefix: "Leçon",
      passToUnlock: "Terminez le quiz de la leçon précédente pour la débloquer.",
    },
    placement: {
      title: "Test de placement",
      lead:
        "Répondez à quelques questions pour que nous puissions vous placer au bon niveau dans chaque matière.",
      submitAssessment: "Envoyer le test",
      noPlacementTests: "Aucun test de placement disponible pour le moment.",
      submitPlacementTest: "Envoyer le test de placement",
      passSummary: "Le placement est terminé.",
    },
    admin: {
      title: "Administration",
      lead:
        "Créez des matières, construisez des parcours de leçons, ajoutez des quiz et configurez les tests de placement.",
      subjects: "Matières",
      lessons: "Leçons",
      placement: "Placement",
      createSubject: "Créer une matière",
      subjectName: "Nom de la matière",
      addSubject: "Ajouter la matière",
      createLesson: "Ajouter une leçon à une matière",
      addLesson: "Ajouter la leçon",
      addQuizQuestion: "Ajouter une question de quiz",
      lessonTitle: "Titre",
      lessonDescription: "Description",
      youtubeUrl: "Lien YouTube",
      order: "Ordre",
      passPercent: "Pourcentage de réussite",
      chooseSubject: "Choisir une matière",
      chooseLesson: "Choisir une leçon",
      addPlacementTest: "Créer un test de placement",
      addAnotherQuestion: "Ajouter une autre question",
      createPlacementTest: "Créer le test",
      placementQuestion: "Question",
      optionsSeparated: "Options séparées par des virgules",
      correctAnswerText: "Texte de la bonne réponse",
      tests: "Tests de placement",
      refresh: "Actualiser",
      delete: "Supprimer",
      loading: "Chargement…",
    },
    status: {
      completed: "terminé",
      unlocked: "débloqué",
      locked: "verrouillé",
    },
    role: {
      admin: "Administrateur",
      student: "Élève",
    },
  },
  ar: {
    nav: {
      home: "الرئيسية",
      subjects: "المواد",
      placement: "التحديد",
      lessons: "الدروس",
      signIn: "تسجيل الدخول",
      getStarted: "ابدأ الآن",
      signOut: "تسجيل الخروج",
      adminSubjects: "المواد",
      adminLessons: "الدروس",
      adminPlacement: "التحديد",
    },
    brand: "دام",
    brandTagline: "تعلّم حسب مستواك",
    switchLabel: "اللغة",
    home: {
      eyebrow: "تعليم دام",
      title: "منصة تعليمية تشبه تطبيقًا حقيقيًا، لا مجرد نموذج سريع.",
      lead:
        "اختبارات التحديد، ومسارات الدروس الموجّهة، والدعم بالفيديو، والاختبارات القصيرة تعمل معًا حتى يعرف الطالب دائمًا الخطوة التالية.",
      createAccount: "إنشاء حساب",
      signIn: "تسجيل الدخول",
      browseSubjects: "استعرض المواد",
      heroBadge: "مسار الطالب",
      heroScore: "تدفق جاهز بنسبة 98%",
      heroSteps: ["التحديد أولًا", "الدروس مرتبة", "الاختبارات تكمل المسار"],
      builtFor: "مصمم للتعليم",
      builtTitle: "بسيط للطلاب، ومنظم بما يكفي لفريق منتج حقيقي.",
      builtCards: [
        "يبدأ الطالب من المستوى المناسب بدلًا من الدخول في قائمة عشوائية.",
        "كل مادة تُفتح بالتسلسل للحفاظ على وضوح التقدم.",
        "الاختبارات القصيرة تثبت الفهم وتوضح ما هو جاهز للانتقال.",
      ],
      teacherEyebrow: "للمعلمين",
      teacherTitle: "أدر المسار التعليمي دون تغيير تجربة الطالب.",
      teacherCopy:
        "تبقى صفحات الإدارة مركزة على المواد والدروس والاختبارات وأسئلة التحديد، بينما يظل مسار الطالب نظيفًا وموجّهًا.",
      whatFeelsBetter: "ما أصبح أفضل الآن",
      betterItems: [
        "صفحات منفصلة لتسجيل الدخول وإنشاء الحساب",
        "حالات تحميل واختبارات أكثر أناقة",
        "بطاقات مواد تقود إلى مسار دروس حقيقي",
      ],
    },
    auth: {
      loginEyebrow: "بوابة الطالب",
      signupEyebrow: "انضم إلى دام",
      loginTitle: "تابع من حيث توقفت في التعلم.",
      signupTitle: "أنشئ حسابًا وابدأ من المستوى المناسب.",
      loginCopy:
        "سجّل الدخول لمتابعة مسار التحديد وفتح الدروس بالترتيب والحفاظ على النتائج في مكان واحد.",
      signupCopy:
        "أنشئ حسابك في ثوانٍ، ثم قم باختبار التحديد لبدء التعلم من المستوى الصحيح.",
      loginHero: ["التحديد أولًا", "الدروس تُفتح بالتسلسل", "الاختبارات تحافظ على الإيقاع"],
      signupHero: ["مسار موجّه", "التحديد يحدد البداية", "دروس واختبارات منظمة"],
      loginIntroEyebrow: "بوابة آمنة",
      signupIntroEyebrow: "انضم إلى الصف",
      loginIntroTitle: "تسجيل الدخول",
      signupIntroTitle: "إنشاء حساب",
      loginIntroCopy: "استخدم حسابك للدخول إلى المواد ومتابعة تقدمك.",
      signupIntroCopy: "أنشئ حسابك ثم قم باختبار التحديد.",
      username: "اسم المستخدم",
      password: "كلمة المرور",
      newHere: "هل أنت جديد هنا؟",
      alreadyHave: "هل لديك حساب بالفعل؟",
      switchToSignup: "إنشاء حساب",
      switchToLogin: "تسجيل الدخول",
      securePortal: "بوابة آمنة",
      joinClassroom: "انضم إلى الصف",
      backHome: "العودة إلى الرئيسية",
    },
    common: {
      loading: "جارٍ التحميل",
      loadingSession: "جارٍ التحقق من الجلسة",
      redirecting: "جارٍ التحويل",
      restoring: "جارٍ استعادة الجلسة",
      openingDashboard: "جارٍ فتح لوحة التحكم",
      preparingClassroom: "جارٍ تجهيز مساحتك",
      loadingSubjects: "جارٍ تحميل موادك",
      loadingSubjectList: "جارٍ تحميل المواد",
      loadingLesson: "جارٍ تحميل الدرس",
      loadingLessons: "جارٍ تحميل الدروس",
      loadingPlacement: "جارٍ تحميل اختبار التحديد",
      loadingPlacementTests: "جارٍ تحميل اختبارات التحديد",
      checkingSession: "جارٍ التحقق من الجلسة",
      submitting: "جارٍ الإرسال…",
      saving: "جارٍ الحفظ…",
      refresh: "تحديث",
      backToHome: "العودة إلى الرئيسية",
      backToLessons: "العودة إلى الدروس",
      continue: "متابعة",
      nextLesson: "الدرس التالي",
      previousLesson: "الدرس السابق",
      backToLessonList: "العودة إلى قائمة الدروس",
      home: "الرئيسية",
      completed: "مكتمل",
      totalLessons: "درسًا إجمالًا",
      questions: "أسئلة",
      completedLabel: "مكتمل",
      unlockedLabel: "مفتوح",
      lockedLabel: "مغلق",
      watchVideo: "مشاهدة الفيديو",
      watchVideoOnYouTube: "شاهد على YouTube",
      copyright: "تعليم دام",
      allRightsReserved: "جميع الحقوق محفوظة",
      lessonNotFound: "الدرس غير موجود",
      returnToList: "العودة إلى القائمة",
      greatWork: "عمل رائع",
      unlockedNextLesson: "لقد فتحت الدرس التالي.",
      completedSubject: "لقد أكملت هذه المادة.",
      continueWhileFresh: "تابع الآن قبل أن يبرد الإيقاع.",
      headBackOrReview: "ارجع إلى قائمة المواد أو راجع الدروس المكتملة.",
      openLesson: "فتح الدرس",
      noSubjects: "لا توجد مواد متاحة حاليًا.",
      noLessons: "لا توجد دروس متاحة لهذه المادة.",
      noPlacementTests: "لا توجد اختبارات تحديد متاحة.",
      placementReady: "اختبار التحديد جاهز.",
      placementComplete: "اكتمل التحديد",
      placementRequired: "يلزم إجراء اختبار تحديد.",
      answerEveryQuestion: "يرجى الإجابة عن جميع الأسئلة.",
      lessonPath: "مسار الدروس",
      chooseSubject: "اختر مادة",
    },
    landing: {
      steps: ["التحديد أولًا", "الدروس تبقى مرتبة", "الاختبارات تكمل المسار"],
      highlightLabels: ["مسارات منظمة", "تغذية راجعة فورية", "تحكم المعلم"],
      highlightValues: [
        "3 طبقات للتعلم",
        "نتائج بعد كل درس",
        "أدوات إدارة للمواد والاختبارات",
      ],
    },
    subjects: {
      title: "اختر مادة",
      lead: "كل مادة تحتوي على دروس مرتبة. أكمل الاختبارات لفتح الخطوة التالية.",
      placedBanner: "اكتمل التحديد - مسار التعلم الخاص بك جاهز.",
      openLessons: "فتح الدروس",
    },
    lessonIndex: {
      title: "مسار الدروس",
      lead:
        "اتبع ترتيب الدروس، وأكمل الاختبارات خطوة بخطوة، واحتفظ بتقدمك ظاهرًا مثل أي منصة تعليمية حقيقية.",
      progressLabel: "التقدم",
      continueLabel: "متابعة",
      reviewNextLabel: "مراجعة التالي",
      lessonPrefix: "الدرس",
      openLessonCopy: "افتح هذا الدرس لمشاهدة الفيديو وإجراء الاختبار.",
    },
    lessonDetail: {
      title: "الدرس",
      lead: "اعمل على درس واحد في كل مرة. اجتز الاختبار لفتح الخطوة التالية.",
      lessonPrefix: "الدرس",
      passToUnlock: "أكمل اختبار الدرس السابق لفتحه.",
    },
    placement: {
      title: "اختبار التحديد",
      lead:
        "أجب عن بعض الأسئلة حتى نضعك في المستوى المناسب داخل كل مادة.",
      submitAssessment: "إرسال الاختبار",
      noPlacementTests: "لا توجد اختبارات تحديد في الوقت الحالي.",
      submitPlacementTest: "إرسال اختبار التحديد",
      passSummary: "اكتمل اختبار التحديد.",
    },
    admin: {
      title: "الإدارة",
      lead:
        "أنشئ المواد، وابنِ مسارات الدروس، وأضف الاختبارات القصيرة، واضبط اختبارات التحديد.",
      subjects: "المواد",
      lessons: "الدروس",
      placement: "التحديد",
      createSubject: "إنشاء مادة",
      subjectName: "اسم المادة",
      addSubject: "إضافة المادة",
      createLesson: "إضافة درس إلى مادة",
      addLesson: "إضافة الدرس",
      addQuizQuestion: "إضافة سؤال اختبار",
      lessonTitle: "العنوان",
      lessonDescription: "الوصف",
      youtubeUrl: "رابط YouTube",
      order: "الترتيب",
      passPercent: "نسبة النجاح",
      chooseSubject: "اختر مادة",
      chooseLesson: "اختر درسًا",
      addPlacementTest: "إنشاء اختبار تحديد",
      addAnotherQuestion: "إضافة سؤال آخر",
      createPlacementTest: "إنشاء الاختبار",
      placementQuestion: "السؤال",
      optionsSeparated: "الخيارات مفصولة بفواصل",
      correctAnswerText: "نص الإجابة الصحيحة",
      tests: "اختبارات التحديد",
      refresh: "تحديث",
      delete: "حذف",
      loading: "جارٍ التحميل…",
    },
    status: {
      completed: "مكتمل",
      unlocked: "مفتوح",
      locked: "مغلق",
    },
    role: {
      admin: "مدير",
      student: "طالب",
    },
  },
};

type LocaleContextValue = {
  locale: Locale;
  dir: "ltr" | "rtl";
  setLocale: (locale: Locale) => void;
  t: Messages;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    if (typeof window === "undefined") return "fr";
    const saved = window.localStorage.getItem("edu_locale") as Locale | null;
    if (saved === "ar" || saved === "fr") return saved;
    return navigator.language.toLowerCase().startsWith("ar") ? "ar" : "fr";
  });

  useEffect(() => {
    window.localStorage.setItem("edu_locale", locale);
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
    document.documentElement.dataset.locale = locale;
  }, [locale]);

  const setLocale = useCallback((nextLocale: Locale) => {
    setLocaleState(nextLocale);
  }, []);

  const value = useMemo(
    () => ({
      locale,
      dir: (locale === "ar" ? "rtl" : "ltr") as "ltr" | "rtl",
      setLocale,
      t: messages[locale],
    }),
    [locale, setLocale],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error("useLocale must be used within LocaleProvider");
  }
  return context;
}
