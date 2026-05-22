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
        $math = Subject::create(['name' => 'Mathematics', 'slug' => 'mathematics']);
        $const = Subject::create(['name' => '1987 Constitution', 'slug' => 'constitution']);

        // Math Quiz Set
        $mathSet = QuizSet::create([
            'subject_id' => $math->id,
            'name' => 'Practice Set 01',
            'order_index' => 1
        ]);

        $q1 = Question::create([
            'quiz_set_id' => $mathSet->id,
            'question_text' => 'There are 36 pieces of booklets in the box. If 1 and ¼ dozens of booklets were sold on June, how many booklets are left in the box?',
            'explanation' => '1 dozen = 12. 1/4 dozen = 3. Total sold = 15. 36 - 15 = 21.'
        ]);
        Answer::create(['question_id' => $q1->id, 'answer_text' => '19', 'is_correct' => false]);
        Answer::create(['question_id' => $q1->id, 'answer_text' => '20', 'is_correct' => false]);
        Answer::create(['question_id' => $q1->id, 'answer_text' => '21', 'is_correct' => true]);
        Answer::create(['question_id' => $q1->id, 'answer_text' => '22', 'is_correct' => false]);

        $q2 = Question::create([
            'quiz_set_id' => $mathSet->id,
            'question_text' => 'What is 15% of 200?',
            'explanation' => '0.15 * 200 = 30.'
        ]);
        Answer::create(['question_id' => $q2->id, 'answer_text' => '20', 'is_correct' => false]);
        Answer::create(['question_id' => $q2->id, 'answer_text' => '30', 'is_correct' => true]);
        Answer::create(['question_id' => $q2->id, 'answer_text' => '40', 'is_correct' => false]);
        Answer::create(['question_id' => $q2->id, 'answer_text' => '50', 'is_correct' => false]);

        // Constitution Quiz Set
        $constSet = QuizSet::create([
            'subject_id' => $const->id,
            'name' => 'Practice Set 01',
            'order_index' => 1
        ]);

        $q3 = Question::create([
            'quiz_set_id' => $constSet->id,
            'question_text' => 'It is the preceding part of the 1987 Constitution of the Philippines.',
            'explanation' => 'The Preamble is the introductory part of the Constitution.'
        ]);
        Answer::create(['question_id' => $q3->id, 'answer_text' => 'National Territory', 'is_correct' => false]);
        Answer::create(['question_id' => $q3->id, 'answer_text' => 'Bill of Rights', 'is_correct' => false]);
        Answer::create(['question_id' => $q3->id, 'answer_text' => 'Citizenship', 'is_correct' => false]);
        Answer::create(['question_id' => $q3->id, 'answer_text' => 'Preamble', 'is_correct' => true]);
    }
}
