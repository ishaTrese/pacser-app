<?php

namespace Database\Seeders;

use App\Models\Answer;
use App\Models\Question;
use App\Models\QuizSet;
use App\Models\Subject;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SubjectSeeder extends Seeder
{
    public function run(): void
    {
        $subjects = $this->subjects();

        DB::transaction(function () use ($subjects) {
            foreach ($subjects as $subjectData) {
                $subject = Subject::updateOrCreate(
                    ['slug' => $subjectData['slug']],
                    ['name' => $subjectData['name']]
                );

                foreach ($subjectData['sets'] as $setData) {
                    $quizSet = QuizSet::updateOrCreate(
                        [
                            'subject_id' => $subject->id,
                            'order_index' => $setData['order_index'],
                        ],
                        [
                            'name' => $setData['name'],
                            'difficulty' => $setData['difficulty'],
                        ]
                    );

                    $quizSet->questions()->delete();

                    foreach ($setData['questions'] as $questionData) {
                        $question = Question::create([
                            'quiz_set_id' => $quizSet->id,
                            'question_text' => $questionData['q'],
                            'explanation' => $questionData['exp'],
                        ]);

                        foreach ($questionData['opts'] as $index => $answerText) {
                            Answer::create([
                                'question_id' => $question->id,
                                'answer_text' => $answerText,
                                'is_correct' => $index === $questionData['ans'],
                            ]);
                        }
                    }
                }
            }
        });
    }

    private function subjects(): array
    {
        return [
            [
                'name' => 'Numerical Ability',
                'slug' => 'numerical-ability',
                'sets' => [
                    $this->set('Numerical Ability Set 1 - Easy Practice', 1, 'easy', [
                        ['q' => 'What is 25% of 200?', 'opts' => ['25', '40', '50', '75'], 'ans' => 2, 'exp' => '25% is one fourth. One fourth of 200 is 50.'],
                        ['q' => 'A pen costs 12 pesos. How much do 5 pens cost?', 'opts' => ['50 pesos', '55 pesos', '60 pesos', '65 pesos'], 'ans' => 2, 'exp' => '12 multiplied by 5 equals 60.'],
                        ['q' => 'What is 18 + 27?', 'opts' => ['35', '40', '45', '55'], 'ans' => 2, 'exp' => '18 + 27 = 45.'],
                        ['q' => 'If 3 notebooks cost 90 pesos, how much is 1 notebook?', 'opts' => ['20 pesos', '25 pesos', '30 pesos', '35 pesos'], 'ans' => 2, 'exp' => '90 divided by 3 equals 30.'],
                        ['q' => 'What is 7 multiplied by 8?', 'opts' => ['54', '56', '58', '64'], 'ans' => 1, 'exp' => '7 x 8 = 56.'],
                        ['q' => 'Which fraction is equal to 0.5?', 'opts' => ['1/4', '1/3', '1/2', '3/4'], 'ans' => 2, 'exp' => '0.5 is one half.'],
                        ['q' => 'A bus leaves at 8:00 AM and arrives at 10:30 AM. How long was the trip?', 'opts' => ['2 hours', '2 hours 30 minutes', '3 hours', '3 hours 30 minutes'], 'ans' => 1, 'exp' => 'From 8:00 to 10:30 is 2 hours and 30 minutes.'],
                        ['q' => 'What is 100 minus 37?', 'opts' => ['53', '63', '67', '73'], 'ans' => 1, 'exp' => '100 - 37 = 63.'],
                        ['q' => 'What comes next: 5, 10, 15, 20, ?', 'opts' => ['22', '24', '25', '30'], 'ans' => 2, 'exp' => 'The pattern adds 5 each time.'],
                        ['q' => 'If a class has 12 boys and 18 girls, how many students are there?', 'opts' => ['24', '28', '30', '36'], 'ans' => 2, 'exp' => '12 + 18 = 30 students.'],
                    ]),
                    $this->set('Numerical Ability Set 2 - Average Practice', 2, 'average', [
                        ['q' => 'A product costs 800 pesos after a 20% discount. What was the original price?', 'opts' => ['900 pesos', '960 pesos', '1,000 pesos', '1,200 pesos'], 'ans' => 2, 'exp' => '800 is 80% of the original price. 800 / 0.80 = 1,000.'],
                        ['q' => 'What is the average of 12, 18, 20, and 30?', 'opts' => ['18', '19', '20', '22'], 'ans' => 2, 'exp' => 'The sum is 80. Divide by 4 to get 20.'],
                        ['q' => 'A worker earns 650 pesos per day. How much will the worker earn in 6 days?', 'opts' => ['3,600 pesos', '3,800 pesos', '3,900 pesos', '4,100 pesos'], 'ans' => 2, 'exp' => '650 x 6 = 3,900.'],
                        ['q' => 'If 4 machines finish a job in 12 hours, how long will 8 machines take at the same rate?', 'opts' => ['4 hours', '6 hours', '8 hours', '10 hours'], 'ans' => 1, 'exp' => 'Doubling the machines halves the time. 12 / 2 = 6 hours.'],
                        ['q' => 'What is 3/5 of 250?', 'opts' => ['100', '125', '150', '175'], 'ans' => 2, 'exp' => '250 divided by 5 is 50. 50 x 3 = 150.'],
                        ['q' => 'A number increased by 15 is 42. What is the number?', 'opts' => ['17', '27', '32', '57'], 'ans' => 1, 'exp' => '42 - 15 = 27.'],
                        ['q' => 'What is the ratio of 15 minutes to 1 hour?', 'opts' => ['1:2', '1:3', '1:4', '1:6'], 'ans' => 2, 'exp' => '1 hour is 60 minutes. 15:60 simplifies to 1:4.'],
                        ['q' => 'A rectangle has a length of 14 cm and width of 9 cm. What is its area?', 'opts' => ['46 sq cm', '86 sq cm', '126 sq cm', '146 sq cm'], 'ans' => 2, 'exp' => 'Area = length x width = 14 x 9 = 126.'],
                        ['q' => 'What is the next number: 3, 6, 12, 24, ?', 'opts' => ['30', '36', '42', '48'], 'ans' => 3, 'exp' => 'Each term is doubled.'],
                        ['q' => 'If 2.5 liters of juice are shared equally among 5 people, how much does each get?', 'opts' => ['0.25 L', '0.5 L', '0.75 L', '1 L'], 'ans' => 1, 'exp' => '2.5 divided by 5 equals 0.5 liter.'],
                    ]),
                    $this->set('Numerical Ability Set 3 - Difficult Practice', 3, 'difficult', [
                        ['q' => 'A salary increased from 18,000 to 20,700 pesos. What is the percent increase?', 'opts' => ['10%', '12%', '15%', '18%'], 'ans' => 2, 'exp' => 'Increase is 2,700. 2,700 / 18,000 = 0.15 or 15%.'],
                        ['q' => 'If 6 clerks encode 360 records in 4 hours, how many records can 9 clerks encode in 5 hours at the same rate?', 'opts' => ['540', '600', '675', '720'], 'ans' => 2, 'exp' => 'Each clerk encodes 15 records per hour. 9 x 5 x 15 = 675.'],
                        ['q' => 'The average of five numbers is 28. Four numbers are 21, 25, 30, and 34. What is the fifth?', 'opts' => ['26', '28', '30', '32'], 'ans' => 2, 'exp' => 'Total is 5 x 28 = 140. Known sum is 110. Fifth is 30.'],
                        ['q' => 'A map scale is 1 cm to 4 km. If two towns are 7.5 cm apart on the map, how far apart are they?', 'opts' => ['18 km', '24 km', '30 km', '34 km'], 'ans' => 2, 'exp' => '7.5 x 4 = 30 kilometers.'],
                        ['q' => 'What is the compound value of 1,000 pesos after 2 years at 10% per year?', 'opts' => ['1,100 pesos', '1,200 pesos', '1,210 pesos', '1,220 pesos'], 'ans' => 2, 'exp' => '1,000 x 1.10 x 1.10 = 1,210.'],
                        ['q' => 'A tank is 3/4 full. After 20 liters are used, it is 1/2 full. What is the tank capacity?', 'opts' => ['60 L', '70 L', '80 L', '100 L'], 'ans' => 2, 'exp' => 'The used amount is 1/4 of the tank. If 1/4 is 20 L, full capacity is 80 L.'],
                        ['q' => 'Solve: 2x + 3 = 17 and x + y = 12. What is y?', 'opts' => ['3', '4', '5', '6'], 'ans' => 2, 'exp' => '2x = 14, so x = 7. Then y = 12 - 7 = 5.'],
                        ['q' => 'A car travels 45 km in 30 minutes. What is its speed in km/h?', 'opts' => ['60', '75', '90', '100'], 'ans' => 2, 'exp' => '30 minutes is 0.5 hour. 45 / 0.5 = 90 km/h.'],
                        ['q' => 'If 40% of a number is 96, what is 75% of the number?', 'opts' => ['160', '180', '200', '240'], 'ans' => 1, 'exp' => 'The number is 96 / 0.40 = 240. 75% of 240 is 180.'],
                        ['q' => 'A sequence follows n squared plus 1. What is the 6th term?', 'opts' => ['31', '35', '37', '43'], 'ans' => 2, 'exp' => '6 squared plus 1 is 36 + 1 = 37.'],
                    ]),
                ],
            ],
            [
                'name' => 'Analytical Ability',
                'slug' => 'analytical-ability',
                'sets' => [
                    $this->set('Analytical Ability Set 1 - Easy Practice', 1, 'easy', [
                        ['q' => 'All supervisors are employees. Maria is a supervisor. What must be true?', 'opts' => ['Maria is an employee', 'Maria is a manager', 'All employees are supervisors', 'No supervisors are employees'], 'ans' => 0, 'exp' => 'If all supervisors are employees, every supervisor, including Maria, is an employee.'],
                        ['q' => 'Which item does not belong: apple, banana, carrot, mango?', 'opts' => ['Apple', 'Banana', 'Carrot', 'Mango'], 'ans' => 2, 'exp' => 'Carrot is a vegetable; the others are fruits.'],
                        ['q' => 'Complete the analogy: Hand is to glove as foot is to ____.', 'opts' => ['Hat', 'Shoe', 'Belt', 'Ring'], 'ans' => 1, 'exp' => 'A glove is worn on a hand, and a shoe is worn on a foot.'],
                        ['q' => 'If today is Monday, what day is it after three days?', 'opts' => ['Tuesday', 'Wednesday', 'Thursday', 'Friday'], 'ans' => 2, 'exp' => 'Tuesday is one day, Wednesday is two, Thursday is three.'],
                        ['q' => 'Which number does not belong: 2, 4, 6, 9, 10?', 'opts' => ['4', '6', '9', '10'], 'ans' => 2, 'exp' => '9 is odd; the others are even.'],
                        ['q' => 'Complete the pattern: A, C, E, G, ?', 'opts' => ['H', 'I', 'J', 'K'], 'ans' => 1, 'exp' => 'The pattern skips one letter each time.'],
                        ['q' => 'If all roses are flowers, which statement is true?', 'opts' => ['All flowers are roses', 'Some flowers are roses', 'No roses are flowers', 'Roses are trees'], 'ans' => 1, 'exp' => 'Roses are included within flowers, so some flowers are roses.'],
                        ['q' => 'Book is to reading as spoon is to ____.', 'opts' => ['Writing', 'Eating', 'Sleeping', 'Driving'], 'ans' => 1, 'exp' => 'A book is used for reading, and a spoon is used for eating.'],
                        ['q' => 'Which comes next: 1, 3, 5, 7, ?', 'opts' => ['8', '9', '10', '11'], 'ans' => 1, 'exp' => 'The sequence lists odd numbers.'],
                        ['q' => 'If Ana is taller than Ben and Ben is taller than Carlo, who is tallest?', 'opts' => ['Ana', 'Ben', 'Carlo', 'Cannot be determined'], 'ans' => 0, 'exp' => 'Ana is taller than Ben, who is taller than Carlo.'],
                    ]),
                    $this->set('Analytical Ability Set 2 - Average Practice', 2, 'average', [
                        ['q' => 'All applicants who passed submitted documents. Leo passed. What follows?', 'opts' => ['Leo submitted documents', 'Leo failed', 'All who submitted passed', 'No applicant submitted documents'], 'ans' => 0, 'exp' => 'Passing is enough to conclude that Leo submitted documents.'],
                        ['q' => 'Complete the analogy: Policy is to office as rule is to ____.', 'opts' => ['Game', 'Paper', 'Window', 'Chair'], 'ans' => 0, 'exp' => 'A policy guides an office; a rule guides a game.'],
                        ['q' => 'Which pair has the same relationship as doctor:hospital?', 'opts' => ['Teacher:school', 'Driver:book', 'Farmer:computer', 'Chef:road'], 'ans' => 0, 'exp' => 'A doctor commonly works in a hospital; a teacher commonly works in a school.'],
                        ['q' => 'If no clerks are managers and some employees are clerks, what must be true?', 'opts' => ['Some employees are not managers', 'All employees are managers', 'Some managers are clerks', 'No employees are clerks'], 'ans' => 0, 'exp' => 'Some employees are clerks, and clerks cannot be managers.'],
                        ['q' => 'A code changes CAT to DBU. How is DOG coded?', 'opts' => ['EPH', 'ENH', 'FPI', 'CNG'], 'ans' => 0, 'exp' => 'Each letter moves one step forward: D to E, O to P, G to H.'],
                        ['q' => 'Find the next term: 2, 5, 11, 23, ?', 'opts' => ['35', '41', '47', '49'], 'ans' => 2, 'exp' => 'Each term is doubled then plus 1. 23 x 2 + 1 = 47.'],
                        ['q' => 'If Rina is between Lito and Maya, and Lito is first, who is third?', 'opts' => ['Rina', 'Lito', 'Maya', 'Cannot be determined'], 'ans' => 2, 'exp' => 'Order is Lito, Rina, Maya.'],
                        ['q' => 'Which assumption is needed: The office will close early because the typhoon signal is raised.', 'opts' => ['The office closes early during raised typhoon signals', 'All employees are absent', 'The office has no work', 'The typhoon is over'], 'ans' => 0, 'exp' => 'The conclusion depends on the rule connecting typhoon signals to early closure.'],
                        ['q' => 'Choose the strongest conclusion: All forms received today are stamped. This form was received today.', 'opts' => ['This form is stamped', 'This form is lost', 'This form is unsigned', 'This form is old'], 'ans' => 0, 'exp' => 'The rule applies directly to this form.'],
                        ['q' => 'A statement says, "Only registered voters may vote." Which person may vote?', 'opts' => ['A registered voter', 'A minor with no registration', 'A visitor', 'An unregistered resident'], 'ans' => 0, 'exp' => 'Registration is required to vote.'],
                    ]),
                    $this->set('Analytical Ability Set 3 - Difficult Practice', 3, 'difficult', [
                        ['q' => 'All auditors are accountants. Some accountants are consultants. Which conclusion is valid?', 'opts' => ['Some auditors are consultants', 'All consultants are auditors', 'All auditors are accountants', 'No accountants are auditors'], 'ans' => 2, 'exp' => 'Only the direct statement that all auditors are accountants must be true.'],
                        ['q' => 'In a row, P is left of Q, R is right of Q, and S is between P and Q. Who is immediately left of Q?', 'opts' => ['P', 'R', 'S', 'Cannot be determined'], 'ans' => 2, 'exp' => 'The order must be P, S, Q, R for S to be between P and Q.'],
                        ['q' => 'If A means plus, B means minus, C means multiply, and D means divide, what is 8 C 2 A 6 B 4?', 'opts' => ['14', '16', '18', '20'], 'ans' => 2, 'exp' => '8 x 2 + 6 - 4 = 18.'],
                        ['q' => 'A code reverses the alphabet position: A becomes Z, B becomes Y. What does C become?', 'opts' => ['X', 'W', 'Y', 'V'], 'ans' => 0, 'exp' => 'C is the third letter, so it maps to the third from the end, X.'],
                        ['q' => 'Statement: Some reports are urgent. All urgent items are reviewed today. What follows?', 'opts' => ['Some reports are reviewed today', 'All reports are urgent', 'No reports are reviewed today', 'All reviewed items are reports'], 'ans' => 0, 'exp' => 'The urgent reports are included in items reviewed today.'],
                        ['q' => 'Find the missing term: 4, 9, 19, 39, ?', 'opts' => ['59', '69', '79', '89'], 'ans' => 2, 'exp' => 'Each term is doubled plus 1: 39 x 2 + 1 = 79.'],
                        ['q' => 'If the first two statements are true, what about the third? All files in Cabinet A are confidential. This file is confidential. This file is in Cabinet A.', 'opts' => ['True', 'False', 'Uncertain', 'Contradictory'], 'ans' => 2, 'exp' => 'A confidential file may be in another cabinet.'],
                        ['q' => 'Five employees A, B, C, D, E line up. A is before C. B is after C. D is before A. Who cannot be first?', 'opts' => ['A', 'B', 'D', 'E'], 'ans' => 1, 'exp' => 'B must be after C, so B cannot be first.'],
                        ['q' => 'Which weakens the claim: "Longer office hours always improve service."', 'opts' => ['Some offices with longer hours had fewer transactions', 'Citizens like convenient schedules', 'Offices need staff', 'Service counters use forms'], 'ans' => 0, 'exp' => 'Lower transactions despite longer hours challenges the word always.'],
                        ['q' => 'A policy applies to permanent employees only. Joan is contractual. What is valid?', 'opts' => ['The policy definitely applies to Joan', 'The policy does not apply based on this rule', 'Joan is permanent', 'All contractual workers are covered'], 'ans' => 1, 'exp' => 'The given rule limits the policy to permanent employees.'],
                    ]),
                ],
            ],
            [
                'name' => 'Clerical Ability',
                'slug' => 'clerical-ability',
                'sets' => [
                    $this->set('Clerical Ability Set 1 - Easy Practice', 1, 'easy', [
                        ['q' => 'Which name comes first alphabetically?', 'opts' => ['Santos', 'Reyes', 'Aquino', 'Dela Cruz'], 'ans' => 2, 'exp' => 'Aquino begins with A, which comes before D, R, and S.'],
                        ['q' => 'Which file number is smallest?', 'opts' => ['2026-015', '2026-005', '2026-050', '2026-025'], 'ans' => 1, 'exp' => '005 is the smallest number.'],
                        ['q' => 'Arrange these letters alphabetically: D, B, A, C. Which comes second?', 'opts' => ['A', 'B', 'C', 'D'], 'ans' => 1, 'exp' => 'Alphabetical order is A, B, C, D.'],
                        ['q' => 'Which date comes earliest?', 'opts' => ['June 5, 2026', 'May 30, 2026', 'June 1, 2026', 'July 1, 2026'], 'ans' => 1, 'exp' => 'May 30 comes before all June and July dates.'],
                        ['q' => 'Which word is spelled correctly?', 'opts' => ['Goverment', 'Government', 'Governmant', 'Goverrnment'], 'ans' => 1, 'exp' => 'Government is the correct spelling.'],
                        ['q' => 'Which office code should be filed first?', 'opts' => ['HR-003', 'HR-001', 'HR-010', 'HR-002'], 'ans' => 1, 'exp' => 'HR-001 has the lowest sequence number.'],
                        ['q' => 'A memo marked "Urgent" should usually be handled ____.', 'opts' => ['last', 'next week', 'promptly', 'after archiving'], 'ans' => 2, 'exp' => 'Urgent documents require prompt attention.'],
                        ['q' => 'Which item belongs in an office supply inventory?', 'opts' => ['Stapler', 'Vacation leave', 'Building permit', 'Payroll policy'], 'ans' => 0, 'exp' => 'A stapler is an office supply.'],
                        ['q' => 'Which surname comes last alphabetically?', 'opts' => ['Garcia', 'Gomez', 'Gonzales', 'Galang'], 'ans' => 2, 'exp' => 'Gonzales comes after Gomez, Garcia, and Galang.'],
                        ['q' => 'What should be checked before filing a document?', 'opts' => ['Folder color only', 'Correct label and completeness', 'Desk location only', 'Staple size only'], 'ans' => 1, 'exp' => 'Correct labels and completeness help prevent filing errors.'],
                    ]),
                    $this->set('Clerical Ability Set 2 - Average Practice', 2, 'average', [
                        ['q' => 'Which sequence is in correct alphabetical order?', 'opts' => ['Almeda, Alvarez, Andres, Aquino', 'Alvarez, Almeda, Andres, Aquino', 'Andres, Almeda, Alvarez, Aquino', 'Aquino, Andres, Alvarez, Almeda'], 'ans' => 1, 'exp' => 'Compare letter by letter: Alvarez, Almeda, Andres, Aquino.'],
                        ['q' => 'Which document number follows 24-08-119?', 'opts' => ['24-08-120', '24-09-001', '24-08-118', '25-08-119'], 'ans' => 0, 'exp' => 'The next number after 119 in the same series is 120.'],
                        ['q' => 'A file labeled "Personnel - Leave - 2026" should be filed under which main category?', 'opts' => ['Finance', 'Personnel', 'Procurement', 'Records Disposal'], 'ans' => 1, 'exp' => 'The main category appears first: Personnel.'],
                        ['q' => 'Which entry has an error in capitalization?', 'opts' => ['Civil Service Commission', 'Department of Health', 'office of the mayor', 'Bureau of Fire Protection'], 'ans' => 2, 'exp' => 'Office of the Mayor should be capitalized as a proper office name.'],
                        ['q' => 'Which date is latest?', 'opts' => ['03/15/2026', '03/05/2026', '04/01/2026', '02/28/2026'], 'ans' => 2, 'exp' => 'April 1, 2026 is later than the February and March dates.'],
                        ['q' => 'If incoming letters are stamped in order received, what should be stamped first?', 'opts' => ['Letter received at 9:15 AM', 'Letter received at 8:45 AM', 'Letter received at 10:00 AM', 'Letter received at 9:30 AM'], 'ans' => 1, 'exp' => '8:45 AM is the earliest receipt time.'],
                        ['q' => 'Which is the correct filing order?', 'opts' => ['Del Rosario, De Leon, Dela Cruz, Diaz', 'De Leon, Dela Cruz, Del Rosario, Diaz', 'Diaz, Del Rosario, Dela Cruz, De Leon', 'Dela Cruz, De Leon, Del Rosario, Diaz'], 'ans' => 1, 'exp' => 'Alphabetically, De Leon comes before Dela Cruz, then Del Rosario, then Diaz.'],
                        ['q' => 'A document marked "For signature" should be sent to ____.', 'opts' => ['the signing authority', 'the supply room', 'the archive immediately', 'the public bulletin board'], 'ans' => 0, 'exp' => 'A document for signature goes to the person authorized to sign.'],
                        ['q' => 'Which data is usually needed for an employee record?', 'opts' => ['Favorite color', 'Employee number', 'Lunch order', 'Office plant type'], 'ans' => 1, 'exp' => 'Employee number is a standard identifying record.'],
                        ['q' => 'Which code is out of order: ADM-101, ADM-102, ADM-104, ADM-103?', 'opts' => ['ADM-101', 'ADM-102', 'ADM-104', 'ADM-103'], 'ans' => 2, 'exp' => 'ADM-104 appears before ADM-103, so it is out of order.'],
                    ]),
                    $this->set('Clerical Ability Set 3 - Difficult Practice', 3, 'difficult', [
                        ['q' => 'Arrange alphabetically: Maceda, Machado, Magno, Mabini. Which is third?', 'opts' => ['Mabini', 'Maceda', 'Machado', 'Magno'], 'ans' => 2, 'exp' => 'Order is Mabini, Maceda, Machado, Magno.'],
                        ['q' => 'Which file should come immediately after REC-2026-099?', 'opts' => ['REC-2026-098', 'REC-2026-100', 'REC-2027-001', 'REC-2026-090'], 'ans' => 1, 'exp' => 'The next sequence number is 100 in the same year and code.'],
                        ['q' => 'Which pair is not in correct chronological order?', 'opts' => ['Jan 5 then Jan 8', 'Feb 10 then Mar 1', 'Apr 12 then Apr 11', 'May 1 then May 20'], 'ans' => 2, 'exp' => 'April 12 comes after April 11, so the pair is reversed.'],
                        ['q' => 'A request has attachments A, B, and C. Attachment B is missing. What should the clerk do first?', 'opts' => ['Process as complete', 'Note the missing attachment and request completion', 'Discard the request', 'Change the document date'], 'ans' => 1, 'exp' => 'Incomplete documents should be noted and completed before processing.'],
                        ['q' => 'Which filing order is correct?', 'opts' => ['Cruz, Cruzado, Cruzata, Cuizon', 'Cruz, Cruzata, Cruzado, Cuizon', 'Cuizon, Cruz, Cruzado, Cruzata', 'Cruzata, Cruzado, Cruz, Cuizon'], 'ans' => 1, 'exp' => 'Cruz comes first, then compare Cruza: Cruzata comes before Cruzado, then Cuizon.'],
                        ['q' => 'If documents are filed by year, then department, then number, which comes first?', 'opts' => ['2025-HR-010', '2026-ADM-001', '2025-ADM-020', '2026-HR-001'], 'ans' => 2, 'exp' => 'Year 2025 comes before 2026; within 2025, ADM comes before HR.'],
                        ['q' => 'Which line has an inconsistent format?', 'opts' => ['2026-06-01 | Received', '2026-06-02 | Released', '06/03/2026 | Filed', '2026-06-04 | Archived'], 'ans' => 2, 'exp' => 'The third line uses a different date format.'],
                        ['q' => 'A form requires two signatures. Only one is present. What is its status?', 'opts' => ['Complete', 'Duplicate', 'Incomplete', 'Archived'], 'ans' => 2, 'exp' => 'A missing required signature makes the form incomplete.'],
                        ['q' => 'Which name should be filed first?', 'opts' => ['San Pedro', 'Santiago', 'Santos', 'Salazar'], 'ans' => 3, 'exp' => 'Salazar comes before San Pedro, Santiago, and Santos.'],
                        ['q' => 'Which record detail best prevents duplicate entries?', 'opts' => ['Employee ID number', 'Desk color', 'Lunch schedule', 'Preferred pen'], 'ans' => 0, 'exp' => 'A unique employee ID helps identify duplicate records.'],
                    ]),
                ],
            ],
            [
                'name' => 'Verbal Ability',
                'slug' => 'verbal-ability',
                'sets' => [
                    $this->set('Verbal Ability Set 1 - Easy Practice', 1, 'easy', [
                        ['q' => 'Choose the correct sentence.', 'opts' => ['She go to work daily.', 'She goes to work daily.', 'She going to work daily.', 'She gone to work daily.'], 'ans' => 1, 'exp' => 'A singular subject uses goes in the simple present tense.'],
                        ['q' => 'What is the synonym of "quick"?', 'opts' => ['Fast', 'Slow', 'Late', 'Weak'], 'ans' => 0, 'exp' => 'Quick means fast.'],
                        ['q' => 'Choose the antonym of "honest".', 'opts' => ['Truthful', 'Sincere', 'Dishonest', 'Fair'], 'ans' => 2, 'exp' => 'Dishonest is the opposite of honest.'],
                        ['q' => 'Fill in the blank: The files ____ on the table.', 'opts' => ['is', 'are', 'was', 'be'], 'ans' => 1, 'exp' => 'Files is plural, so the correct verb is are.'],
                        ['q' => 'Which word is a noun?', 'opts' => ['Run', 'Happy', 'Office', 'Quickly'], 'ans' => 2, 'exp' => 'Office names a place, so it is a noun.'],
                        ['q' => 'Choose the correctly spelled word.', 'opts' => ['Recieve', 'Receive', 'Receeve', 'Receve'], 'ans' => 1, 'exp' => 'Receive is spelled with ei after c.'],
                        ['q' => 'Which sentence uses a capital letter correctly?', 'opts' => ['maria works in Manila.', 'Maria works in manila.', 'Maria works in Manila.', 'maria works in manila.'], 'ans' => 2, 'exp' => 'Names of persons and places are capitalized.'],
                        ['q' => 'Fill in the blank: Please submit the report ____ Friday.', 'opts' => ['on', 'in', 'at', 'by at'], 'ans' => 0, 'exp' => 'On is used with days.'],
                        ['q' => 'What does "assist" mean?', 'opts' => ['Help', 'Delay', 'Reject', 'Hide'], 'ans' => 0, 'exp' => 'Assist means to help.'],
                        ['q' => 'Which is a complete sentence?', 'opts' => ['Because of the rain.', 'The clerk answered the call.', 'Running to the office.', 'After the meeting.'], 'ans' => 1, 'exp' => 'It has a subject and predicate and expresses a complete thought.'],
                    ]),
                    $this->set('Verbal Ability Set 2 - Average Practice', 2, 'average', [
                        ['q' => 'Choose the sentence with correct subject-verb agreement.', 'opts' => ['The employees is ready.', 'The employee are ready.', 'The employees are ready.', 'The employees was ready.'], 'ans' => 2, 'exp' => 'Employees is plural, so the verb should be are.'],
                        ['q' => 'What is the meaning of "implement" in a policy context?', 'opts' => ['Cancel', 'Carry out', 'Ignore', 'Question'], 'ans' => 1, 'exp' => 'To implement a policy means to carry it out.'],
                        ['q' => 'Choose the best connector: The office was closed, ____ the staff worked online.', 'opts' => ['because', 'but', 'although', 'unless'], 'ans' => 1, 'exp' => 'But shows contrast between being closed and still working.'],
                        ['q' => 'Identify the error: Each of the forms are signed.', 'opts' => ['Each', 'of the forms', 'are', 'signed'], 'ans' => 2, 'exp' => 'Each is singular, so the verb should be is.'],
                        ['q' => 'Choose the word closest in meaning to "accurate".', 'opts' => ['Correct', 'Brief', 'Late', 'Formal'], 'ans' => 0, 'exp' => 'Accurate means correct or exact.'],
                        ['q' => 'Fill in the blank: Neither the officer nor the clerks ____ available.', 'opts' => ['is', 'are', 'was', 'be'], 'ans' => 1, 'exp' => 'The verb agrees with the nearer subject, clerks, which is plural.'],
                        ['q' => 'Which sentence is most formal?', 'opts' => ['Send me that thing.', 'Please provide the requested document.', 'Give it here.', 'I need that now.'], 'ans' => 1, 'exp' => 'The wording is polite, specific, and formal.'],
                        ['q' => 'What is the antonym of "mandatory"?', 'opts' => ['Required', 'Optional', 'Official', 'Necessary'], 'ans' => 1, 'exp' => 'Mandatory means required; optional is the opposite.'],
                        ['q' => 'Choose the correct pronoun: The director gave Ana and ____ the memo.', 'opts' => ['I', 'me', 'my', 'mine'], 'ans' => 1, 'exp' => 'The pronoun is an object of the verb gave, so me is correct.'],
                        ['q' => 'Which sentence is clear and concise?', 'opts' => ['At this point in time, we are in receipt of your letter.', 'We received your letter.', 'Your letter was in the process of being received.', 'It is hereby noted that a letter came.'], 'ans' => 1, 'exp' => 'It directly states the message with fewer words.'],
                    ]),
                    $this->set('Verbal Ability Set 3 - Difficult Practice', 3, 'difficult', [
                        ['q' => 'Choose the sentence with correct parallel structure.', 'opts' => ['The clerk filed, sorting, and encoded records.', 'The clerk filed, sorted, and encoded records.', 'The clerk filed, to sort, and encoding records.', 'The clerk filing, sorted, and encoded records.'], 'ans' => 1, 'exp' => 'Filed, sorted, and encoded are parallel past-tense verbs.'],
                        ['q' => 'Which revision is most concise: "Due to the fact that the meeting was canceled, the report was delayed."', 'opts' => ['Because the meeting was canceled, the report was delayed.', 'In view of the cancellation, the report was not on time in a delayed way.', 'The report was delayed due to cancellation of meeting facts.', 'The canceled meeting was a thing that delayed the report.'], 'ans' => 0, 'exp' => 'Because is clearer and shorter than due to the fact that.'],
                        ['q' => 'Identify the misplaced modifier.', 'opts' => ['Walking to the office, the rain soaked my folder.', 'The employee walking to the office carried a folder.', 'The folder was soaked by rain.', 'I walked to the office during the rain.'], 'ans' => 0, 'exp' => 'It sounds as if the rain was walking to the office.'],
                        ['q' => 'Choose the best meaning of "notwithstanding" in a legal sentence.', 'opts' => ['Because of', 'In spite of', 'Instead of', 'According to'], 'ans' => 1, 'exp' => 'Notwithstanding means despite or in spite of.'],
                        ['q' => 'Which sentence uses the subjunctive mood correctly?', 'opts' => ['If I was the supervisor, I will approve it.', 'If I were the supervisor, I would review it.', 'If I am the supervisor, I reviewed it.', 'If I be the supervisor, I approve it.'], 'ans' => 1, 'exp' => 'Were is used for hypothetical statements.'],
                        ['q' => 'Choose the correct transition: The policy is clear. ____, implementation remains inconsistent.', 'opts' => ['Therefore', 'However', 'Likewise', 'For example'], 'ans' => 1, 'exp' => 'However signals contrast.'],
                        ['q' => 'Which sentence avoids redundancy?', 'opts' => ['The final outcome was approved.', 'The outcome was approved.', 'The completely final outcome was approved.', 'The final end result was approved.'], 'ans' => 1, 'exp' => 'Outcome already implies a result, so final is unnecessary.'],
                        ['q' => 'What is the tone of this sentence: "Kindly submit the complete form by noon."', 'opts' => ['Informal and rude', 'Polite and direct', 'Angry and sarcastic', 'Unclear and vague'], 'ans' => 1, 'exp' => 'Kindly and the specific deadline make it polite and direct.'],
                        ['q' => 'Choose the sentence with correct punctuation.', 'opts' => ['The requirements are: ID, form, and receipt.', 'The requirements are ID form and receipt.', 'The requirements, are ID, form and receipt.', 'The requirements are ID, form, receipt,'], 'ans' => 0, 'exp' => 'The colon properly introduces the list.'],
                        ['q' => 'Which word best completes the sentence: The agency must ____ with data privacy rules.', 'opts' => ['comply', 'complaint', 'compliance', 'compliant'], 'ans' => 0, 'exp' => 'A verb is needed after must; comply is the verb.'],
                    ]),
                ],
            ],
            [
                'name' => 'General Information',
                'slug' => 'general-information',
                'sets' => [
                    $this->set('General Information Set 1 - Easy Practice', 1, 'easy', [
                        ['q' => 'What is the supreme law of the Philippines?', 'opts' => ['Civil Code', '1987 Constitution', 'Labor Code', 'Local ordinance'], 'ans' => 1, 'exp' => 'The Constitution is the supreme law of the land.'],
                        ['q' => 'How many branches does the Philippine government have?', 'opts' => ['Two', 'Three', 'Four', 'Five'], 'ans' => 1, 'exp' => 'The branches are executive, legislative, and judicial.'],
                        ['q' => 'Who heads the executive branch of the national government?', 'opts' => ['President', 'Chief Justice', 'Senate President', 'Speaker of the House'], 'ans' => 0, 'exp' => 'The President heads the executive branch.'],
                        ['q' => 'What is public office according to the Constitution?', 'opts' => ['A private business', 'A public trust', 'A family privilege', 'A temporary hobby'], 'ans' => 1, 'exp' => 'Public office is a public trust.'],
                        ['q' => 'Which right protects freedom of speech?', 'opts' => ['Bill of Rights', 'Tax Code', 'Election calendar', 'Budget circular'], 'ans' => 0, 'exp' => 'Freedom of speech is protected in the Bill of Rights.'],
                        ['q' => 'What does CSC stand for?', 'opts' => ['Civil Service Commission', 'Central Salary Council', 'Citizen Safety Code', 'City Service Center'], 'ans' => 0, 'exp' => 'CSC means Civil Service Commission.'],
                        ['q' => 'Which is a basic duty of a public employee?', 'opts' => ['Serve the public', 'Ignore requests', 'Favor relatives', 'Hide records without reason'], 'ans' => 0, 'exp' => 'Public employees are expected to serve the public.'],
                        ['q' => 'Which document proves Filipino citizenship for many purposes?', 'opts' => ['Birth certificate', 'Shopping receipt', 'Bus ticket', 'Office memo'], 'ans' => 0, 'exp' => 'A birth certificate is commonly used to prove citizenship and identity.'],
                        ['q' => 'What is the national language of the Philippines?', 'opts' => ['English', 'Filipino', 'Spanish', 'Mandarin'], 'ans' => 1, 'exp' => 'Filipino is the national language.'],
                        ['q' => 'Which action shows honesty in public service?', 'opts' => ['Reporting correct information', 'Changing records for a friend', 'Accepting hidden gifts', 'Ignoring mistakes'], 'ans' => 0, 'exp' => 'Honesty requires truthful and accurate reporting.'],
                    ]),
                    $this->set('General Information Set 2 - Average Practice', 2, 'average', [
                        ['q' => 'Which branch interprets laws?', 'opts' => ['Executive', 'Legislative', 'Judicial', 'Civil service'], 'ans' => 2, 'exp' => 'The judiciary interprets laws and settles legal disputes.'],
                        ['q' => 'Which body makes national laws?', 'opts' => ['Congress', 'Supreme Court', 'Cabinet', 'Commission on Audit'], 'ans' => 0, 'exp' => 'Congress exercises legislative power.'],
                        ['q' => 'What is the purpose of the SALN?', 'opts' => ['Declare assets, liabilities, and net worth', 'Apply for vacation leave', 'Register a vehicle', 'Request office supplies'], 'ans' => 0, 'exp' => 'SALN stands for Statement of Assets, Liabilities, and Net Worth.'],
                        ['q' => 'Which value means avoiding favoritism in government service?', 'opts' => ['Nepotism', 'Impartiality', 'Delay', 'Secrecy'], 'ans' => 1, 'exp' => 'Impartiality means fair treatment without favoritism.'],
                        ['q' => 'Which commission audits government funds?', 'opts' => ['Commission on Audit', 'Civil Service Commission', 'Commission on Elections', 'Human Rights Commission'], 'ans' => 0, 'exp' => 'COA audits government accounts and expenditures.'],
                        ['q' => 'What is due process?', 'opts' => ['A fair legal procedure', 'A salary increase', 'A voting machine', 'A procurement method'], 'ans' => 0, 'exp' => 'Due process requires fairness before life, liberty, or property is affected.'],
                        ['q' => 'Which principle requires public officials to act for public interest over personal gain?', 'opts' => ['Commitment to public interest', 'Simple living', 'Political dynasty', 'Private monopoly'], 'ans' => 0, 'exp' => 'Public interest should prevail over personal interest.'],
                        ['q' => 'Who has the power to declare a law unconstitutional?', 'opts' => ['Supreme Court', 'Barangay council', 'Provincial treasurer', 'Public school principal'], 'ans' => 0, 'exp' => 'The Supreme Court may rule on constitutionality.'],
                        ['q' => 'What is the usual term of a Philippine senator?', 'opts' => ['3 years', '4 years', '6 years', '9 years'], 'ans' => 2, 'exp' => 'Senators serve six-year terms.'],
                        ['q' => 'Which is an example of accountability?', 'opts' => ['Explaining official actions when required', 'Hiding public documents', 'Blaming citizens', 'Ignoring audit findings'], 'ans' => 0, 'exp' => 'Accountability includes responsibility and explanation for official actions.'],
                    ]),
                    $this->set('General Information Set 3 - Difficult Practice', 3, 'difficult', [
                        ['q' => 'Which constitutional principle limits each branch through the powers of the others?', 'opts' => ['Checks and balances', 'Double jeopardy', 'Eminent domain', 'Suffrage'], 'ans' => 0, 'exp' => 'Checks and balances prevents concentration of power.'],
                        ['q' => 'Which right is involved when private property is taken for public use with payment?', 'opts' => ['Eminent domain with just compensation', 'Freedom of religion', 'Right to travel', 'Right to counsel'], 'ans' => 0, 'exp' => 'Eminent domain requires public use and just compensation.'],
                        ['q' => 'Under RA 6713, public officials should respond to letters and requests within how many working days?', 'opts' => ['5', '10', '15', '30'], 'ans' => 2, 'exp' => 'RA 6713 requires action on letters and requests within 15 working days.'],
                        ['q' => 'Which principle is violated when an official uses position to benefit a relative unfairly?', 'opts' => ['Nepotism or favoritism', 'Transparency', 'Merit system', 'Due process'], 'ans' => 0, 'exp' => 'Using office to unfairly benefit relatives is nepotism or favoritism.'],
                        ['q' => 'Which constitutional body administers elections?', 'opts' => ['COMELEC', 'COA', 'CSC', 'DBM'], 'ans' => 0, 'exp' => 'The Commission on Elections administers elections.'],
                        ['q' => 'What does the merit and fitness principle require in civil service appointments?', 'opts' => ['Selection based on qualifications', 'Selection based on family ties', 'Selection by lottery only', 'Selection based on gifts'], 'ans' => 0, 'exp' => 'Civil service appointments should be based on merit and fitness.'],
                        ['q' => 'Which situation best shows transparency?', 'opts' => ['Publishing clear procurement notices', 'Keeping all bidding secret', 'Changing criteria after bids arrive', 'Refusing lawful information requests'], 'ans' => 0, 'exp' => 'Clear public notices support transparency.'],
                        ['q' => 'Which right prevents a person from being tried twice for the same offense after acquittal?', 'opts' => ['Double jeopardy', 'Search warrant', 'Equal protection', 'Executive privilege'], 'ans' => 0, 'exp' => 'Double jeopardy protects against repeated prosecution for the same offense.'],
                        ['q' => 'Which agency is primarily responsible for career service rules and standards?', 'opts' => ['Civil Service Commission', 'Department of Finance', 'Department of Tourism', 'National Museum'], 'ans' => 0, 'exp' => 'The CSC administers civil service rules and standards.'],
                        ['q' => 'Which action best supports ethical public service during a conflict of interest?', 'opts' => ['Disclose and inhibit when appropriate', 'Hide the conflict', 'Approve the transaction quickly', 'Ask a relative to decide secretly'], 'ans' => 0, 'exp' => 'Disclosure and inhibition help protect integrity and public trust.'],
                    ]),
                ],
            ],
        ];
    }

    private function set(string $name, int $orderIndex, string $difficulty, array $questions): array
    {
        return [
            'name' => $name,
            'order_index' => $orderIndex,
            'difficulty' => $difficulty,
            'questions' => $questions,
        ];
    }
}
