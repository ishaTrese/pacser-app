import { BookOpen, BookText, Brain, Calculator, FileText, Scale } from 'lucide-react';

export const EXAM_SUBJECTS = {
  professional: [
    {
      id: 'numerical-ability',
      title: 'Numerical Ability',
      description: 'Numerical reasoning, data interpretation, basic operations, and word problems.',
      icon: Calculator,
      color: 'bg-blue-50',
      borderColor: 'border-blue-200',
      iconClass: 'text-blue-600 dark:text-blue-400'
    },
    {
      id: 'analytical-ability',
      title: 'Analytical Ability',
      description: 'Logic, abstract reasoning, analogy, and problem analysis.',
      icon: Brain,
      color: 'bg-purple-50',
      borderColor: 'border-purple-200',
      iconClass: 'text-purple-600 dark:text-purple-400'
    },
    {
      id: 'verbal-ability',
      title: 'Verbal Ability',
      description: 'Vocabulary, grammar, reading comprehension, and correct usage.',
      icon: BookOpen,
      color: 'bg-yellow-50',
      borderColor: 'border-yellow-100',
      iconClass: 'text-yellow-600 dark:text-yellow-400'
    },
    {
      id: 'general-information',
      title: 'General Information',
      description: 'Philippine Constitution, public ethics, current events, and civic knowledge.',
      icon: Scale,
      color: 'bg-blue-50',
      borderColor: 'border-blue-200',
      iconClass: 'text-blue-600 dark:text-blue-400'
    }
  ],
  'sub-professional': [
    {
      id: 'numerical-ability',
      title: 'Numerical Ability',
      description: 'Numerical reasoning, data interpretation, basic operations, and word problems.',
      icon: Calculator,
      color: 'bg-blue-50',
      borderColor: 'border-blue-200',
      iconClass: 'text-blue-600 dark:text-blue-400'
    },
    {
      id: 'clerical-ability',
      title: 'Clerical Ability',
      description: 'Filing, sequencing, office procedures, and clerical operations.',
      icon: FileText,
      color: 'bg-purple-50',
      borderColor: 'border-purple-200',
      iconClass: 'text-purple-600 dark:text-purple-400'
    },
    {
      id: 'verbal-ability',
      title: 'Verbal Ability',
      description: 'Vocabulary, grammar, reading comprehension, and correct usage.',
      icon: BookOpen,
      color: 'bg-yellow-50',
      borderColor: 'border-yellow-100',
      iconClass: 'text-yellow-600 dark:text-yellow-400'
    },
    {
      id: 'general-information',
      title: 'General Information',
      description: 'Philippine Constitution, public ethics, current events, and civic knowledge.',
      icon: BookText,
      color: 'bg-blue-50',
      borderColor: 'border-blue-200',
      iconClass: 'text-blue-600 dark:text-blue-400'
    }
  ]
};

export function getExamLevelKey(userClass) {
  return userClass === 'Sub-Professional' ? 'sub-professional' : 'professional';
}

export function getSubjectsForClass(userClass) {
  return EXAM_SUBJECTS[getExamLevelKey(userClass)];
}
