<?php

namespace Database\Seeders;

use App\Models\Answer;
use App\Models\Question;
use App\Models\QuizSet;
use App\Models\Subject;
use Illuminate\Database\Seeder;

class SubjectSeeder extends Seeder
{
    public function run(): void
    {
        $difficultyForOrder = fn (int $orderIndex) => $orderIndex === 3 ? 'difficult' : 'average';

        $subjects = [
            [
                'name' => 'Numerical Ability',
                'slug' => 'numerical-ability',
                'set' => 'Numerical Reasoning Practice Set 01',
                'questions' => [
                    [
                        'question_text' => 'There are 36 booklets in a box. If 1 and 1/4 dozens of booklets were sold, how many booklets are left?',
                        'explanation' => '1 dozen = 12. 1/4 dozen = 3. Total sold = 15. 36 - 15 = 21.',
                        'answers' => [
                            ['answer_text' => '19', 'is_correct' => false],
                            ['answer_text' => '20', 'is_correct' => false],
                            ['answer_text' => '21', 'is_correct' => true],
                            ['answer_text' => '22', 'is_correct' => false],
                        ],
                    ],
                    [
                        'question_text' => 'What is 15% of 200?',
                        'explanation' => '0.15 * 200 = 30.',
                        'answers' => [
                            ['answer_text' => '20', 'is_correct' => false],
                            ['answer_text' => '30', 'is_correct' => true],
                            ['answer_text' => '40', 'is_correct' => false],
                            ['answer_text' => '50', 'is_correct' => false],
                        ],
                    ],
                ],
            ],
            [
                'name' => 'Analytical Ability',
                'slug' => 'analytical-ability',
                'set' => 'Logic and Analysis Practice Set 01',
                'questions' => [
                    [
                        'question_text' => 'All managers are employees. Some employees are analysts. Which statement must be true?',
                        'explanation' => 'The only certain conclusion is that every manager belongs to the employee group.',
                        'answers' => [
                            ['answer_text' => 'All analysts are managers', 'is_correct' => false],
                            ['answer_text' => 'Some managers are analysts', 'is_correct' => false],
                            ['answer_text' => 'All managers are employees', 'is_correct' => true],
                            ['answer_text' => 'No employees are managers', 'is_correct' => false],
                        ],
                    ],
                ],
            ],
            [
                'name' => 'Clerical Ability',
                'slug' => 'clerical-ability',
                'set' => 'Clerical Operations Practice Set 01',
                'questions' => [
                    [
                        'question_text' => 'Which file should come first in alphabetical order?',
                        'explanation' => 'Compare letter by letter. "Alvarez" comes before "Andres", "Aquino", and "Arroyo".',
                        'answers' => [
                            ['answer_text' => 'Andres', 'is_correct' => false],
                            ['answer_text' => 'Alvarez', 'is_correct' => true],
                            ['answer_text' => 'Arroyo', 'is_correct' => false],
                            ['answer_text' => 'Aquino', 'is_correct' => false],
                        ],
                    ],
                ],
            ],
            [
                'name' => 'Verbal Ability',
                'slug' => 'verbal-ability',
                'set' => 'Grammar and Comprehension Practice Set 01',
                'questions' => [
                    [
                        'question_text' => 'Identify the correct sentence.',
                        'explanation' => 'The third-person singular pronoun "he" takes "does not" or "doesn\'t".',
                        'answers' => [
                            ['answer_text' => 'He don\'t know the answer.', 'is_correct' => false],
                            ['answer_text' => 'He doesn\'t know the answer.', 'is_correct' => true],
                            ['answer_text' => 'He isn\'t know the answer.', 'is_correct' => false],
                            ['answer_text' => 'He didn\'t knew the answer.', 'is_correct' => false],
                        ],
                    ],
                ],
            ],
            [
                'name' => 'General Information',
                'slug' => 'general-information',
                'set' => 'Constitution and Public Ethics Practice Set 01',
                'questions' => [
                    [
                        'question_text' => 'Which article in the 1987 Constitution covers the Bill of Rights?',
                        'explanation' => 'Article III of the 1987 Constitution outlines the Bill of Rights.',
                        'answers' => [
                            ['answer_text' => 'Article II', 'is_correct' => false],
                            ['answer_text' => 'Article III', 'is_correct' => true],
                            ['answer_text' => 'Article IV', 'is_correct' => false],
                            ['answer_text' => 'Article V', 'is_correct' => false],
                        ],
                    ],
                ],
            ],
        ];

        foreach ($subjects as $subjectData) {
            $subject = Subject::updateOrCreate(
                ['slug' => $subjectData['slug']],
                ['name' => $subjectData['name']]
            );

            $quizSet = QuizSet::updateOrCreate(
                [
                    'subject_id' => $subject->id,
                    'order_index' => 1,
                ],
                [
                    'name' => $subjectData['set'],
                    'difficulty' => $difficultyForOrder(1),
                ]
            );

            if ($quizSet->questions()->exists()) {
                continue;
            }

            foreach ($subjectData['questions'] as $questionData) {
                $question = Question::create([
                    'quiz_set_id' => $quizSet->id,
                    'question_text' => $questionData['question_text'],
                    'explanation' => $questionData['explanation'],
                ]);

                foreach ($questionData['answers'] as $answerData) {
                    Answer::create([
                        'question_id' => $question->id,
                        'answer_text' => $answerData['answer_text'],
                        'is_correct' => $answerData['is_correct'],
                    ]);
                }
            }
        }
    }
}
