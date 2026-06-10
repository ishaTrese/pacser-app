<?php

namespace Database\Seeders;

use App\Models\Answer;
use App\Models\Question;
use App\Models\QuizSet;
use App\Models\Subject;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class TestBankSeeder extends Seeder
{
    public function run(): void
    {
        $difficultyForOrder = fn (int $orderIndex) => $orderIndex === 3 ? 'difficult' : 'average';

        // Define our dense data array to minimize repetitive insertion logic
        // Format: [ 'q' => 'Question?', 'opts' => ['A', 'B', 'C', 'D'], 'ans' => 1 (Index of correct option), 'exp' => 'Explanation' ]
        
        $testBank = [
            'numerical-ability' => [
                'name' => 'Numerical Ability',
                'slug' => 'numerical-ability',
                'sets' => [
                    'Numerical Word Problems (Set 1)' => [
                        ['q' => 'What is 15% of 200?', 'opts' => ['20', '30', '40', '50'], 'ans' => 1, 'exp' => '0.15 * 200 = 30.'],
                        ['q' => 'If a shirt costs 500 PHP and has a 20% discount, what is the final price?', 'opts' => ['350', '400', '450', '480'], 'ans' => 1, 'exp' => '20% of 500 is 100. 500 - 100 = 400.'],
                        ['q' => 'Solve for x: 3x - 5 = 16', 'opts' => ['5', '6', '7', '8'], 'ans' => 2, 'exp' => '3x = 21, so x = 7.'],
                        ['q' => 'What is the next number in the series: 2, 6, 12, 20, ?', 'opts' => ['28', '30', '32', '36'], 'ans' => 1, 'exp' => 'Differences are 4, 6, 8. Next is 10. 20 + 10 = 30.'],
                        ['q' => 'A train travels 60 km/h. How long to travel 150 km?', 'opts' => ['2 hours', '2.5 hours', '3 hours', '3.5 hours'], 'ans' => 1, 'exp' => 'Time = Distance / Speed = 150 / 60 = 2.5 hours.'],
                        ['q' => 'Evaluate: (12 + 4) / 2 * 3', 'opts' => ['8', '12', '24', '36'], 'ans' => 2, 'exp' => '16 / 2 = 8, then 8 * 3 = 24.'],
                        ['q' => 'A rectangle has length 10 and width 4. What is its perimeter?', 'opts' => ['28', '32', '40', '48'], 'ans' => 0, 'exp' => 'Perimeter = 2(L + W) = 2(14) = 28.'],
                        ['q' => 'If 5 workers can build a wall in 4 days, how long for 10 workers?', 'opts' => ['1 day', '2 days', '3 days', '8 days'], 'ans' => 1, 'exp' => 'Inverse proportion. Double the workers = half the time = 2 days.'],
                        ['q' => 'Convert 3/8 to a decimal.', 'opts' => ['0.375', '0.380', '0.400', '0.625'], 'ans' => 0, 'exp' => '3 divided by 8 is exactly 0.375.'],
                        ['q' => 'What is the lowest common multiple (LCM) of 6 and 8?', 'opts' => ['12', '18', '24', '48'], 'ans' => 2, 'exp' => 'Multiples of 6: 6,12,18,24... Multiples of 8: 8,16,24. 24 is the LCM.'],
                    ]
                ]
            ],
            'general-information-constitution' => [
                'name' => 'General Information',
                'slug' => 'general-information',
                'sets' => [
                    'Articles III and VI (Set 1)' => [
                        ['q' => 'Which article in the 1987 Constitution covers the Bill of Rights?', 'opts' => ['Article II', 'Article III', 'Article IV', 'Article V'], 'ans' => 1, 'exp' => 'Article III explicitly outlines the Bill of Rights.'],
                        ['q' => 'No person shall be deprived of life, liberty, or property without ____.', 'opts' => ['A court order', 'Due process of law', 'Just compensation', 'A warrant'], 'ans' => 1, 'exp' => 'Section 1 of Art III states: without due process of law.'],
                        ['q' => 'Which department is vested with legislative power?', 'opts' => ['Executive', 'Judicial', 'Congress of the Philippines', 'Ombudsman'], 'ans' => 2, 'exp' => 'Article VI vests legislative power in the Congress (Senate and House of Representatives).'],
                        ['q' => 'How many Senators compose the Senate of the Philippines?', 'opts' => ['12', '24', '30', '32'], 'ans' => 1, 'exp' => 'Article VI Section 2 mandates that the Senate shall be composed of 24 Senators.'],
                        ['q' => 'Private property shall not be taken for public use without ____.', 'opts' => ['Due process', 'Just compensation', 'Court permission', 'Congressional approval'], 'ans' => 1, 'exp' => 'Article III Section 9 requires just compensation for eminent domain.'],
                        ['q' => 'The right of the people to be secure in their persons against unreasonable searches is found in what section?', 'opts' => ['Section 1', 'Section 2', 'Section 3', 'Section 4'], 'ans' => 1, 'exp' => 'Article III Section 2 protects against unreasonable searches and seizures.'],
                        ['q' => 'What is the minimum age requirement for a Senator on the day of the election?', 'opts' => ['25 years', '30 years', '35 years', '40 years'], 'ans' => 2, 'exp' => 'Article VI Section 3 states a Senator must be at least 35 years of age.'],
                        ['q' => 'What is the term length for a member of the House of Representatives?', 'opts' => ['3 years', '4 years', '6 years', '9 years'], 'ans' => 0, 'exp' => 'Article VI Section 7 limits House members to a 3-year term.'],
                        ['q' => 'No law shall be passed abridging the freedom of speech, of expression, or of the ____.', 'opts' => ['Religion', 'Press', 'Academia', 'Movement'], 'ans' => 1, 'exp' => 'Article III Section 4 protects freedom of speech, expression, and the press.'],
                        ['q' => 'Which right allows individuals to form unions, associations, or societies for purposes not contrary to law?', 'opts' => ['Right to strike', 'Freedom of Assembly', 'Right to Association', 'Right to Petition'], 'ans' => 2, 'exp' => 'Article III Section 8 guarantees the right to form associations.'],
                    ]
                ]
            ],
            'general-information-code-of-conduct' => [
                'name' => 'General Information',
                'slug' => 'general-information',
                'sets' => [
                    'Ethical Standards (Set 1)' => [
                        ['q' => 'What is the short title of R.A. 6713?', 'opts' => ['Anti-Graft Act', 'Code of Conduct and Ethical Standards for Public Officials', 'Civil Service Law', 'Public Service Act'], 'ans' => 1, 'exp' => 'RA 6713 is known as the Code of Conduct and Ethical Standards for Public Officials and Employees.'],
                        ['q' => 'Public officials and employees shall perform and discharge their duties with the highest degree of ____.', 'opts' => ['Intelligence', 'Excellence', 'Loyalty', 'Honesty'], 'ans' => 1, 'exp' => 'Section 4(b) mandates "Professionalism" — performing duties with the highest degree of excellence.'],
                        ['q' => 'Which principle states that public office is a public trust?', 'opts' => ['Section 1', 'Section 2', 'Section 3', 'Section 4'], 'ans' => 1, 'exp' => 'Section 2 (Declaration of Policy) explicitly states that public office is a public trust.'],
                        ['q' => 'Public officials must remain true to the people at all times. This represents what norm?', 'opts' => ['Justness', 'Political Neutrality', 'Commitment to Public Interest', 'Nationalism'], 'ans' => 2, 'exp' => 'Commitment to Public Interest dictates upholding public interest over personal interest.'],
                        ['q' => 'A public official must not solicit or accept, directly or indirectly, any ____.', 'opts' => ['Gift', 'Award', 'Honorary degree', 'Recommendation'], 'ans' => 0, 'exp' => 'Section 7(d) prohibits soliciting or accepting gifts in the course of official duties.'],
                        ['q' => 'How many days does an official have to respond to letters or requests?', 'opts' => ['5 days', '10 days', '15 days', '30 days'], 'ans' => 2, 'exp' => 'Section 5(a) requires action on letters and requests within 15 working days.'],
                        ['q' => 'Officials are required to file their SALN. What does SALN stand for?', 'opts' => ['Statement of Assets, Liabilities, and Net Worth', 'Summary of Accounts, Loans, and Notes', 'Statement of Actual Land and Nature', 'Summary of Assets, Land, and Net Worth'], 'ans' => 0, 'exp' => 'Section 8 mandates the filing of the Statement of Assets, Liabilities, and Net Worth.'],
                        ['q' => 'Providing public service without discrimination falls under what norm?', 'opts' => ['Professionalism', 'Justness and Sincerity', 'Political Neutrality', 'Responsiveness to the Public'], 'ans' => 1, 'exp' => 'Justness and Sincerity requires acting with equity and without discrimination.'],
                        ['q' => 'Public officials must live ____.', 'opts' => ['Luxuriously', 'Modestly', 'Independently', 'Secludedly'], 'ans' => 1, 'exp' => 'Section 4(h) dictates Simple Living, meaning living modestly.'],
                        ['q' => 'The penalty for violating RA 6713 can include fine, imprisonment, and/or ____.', 'opts' => ['Demotion', 'Transfer', 'Disqualification to hold public office', 'Suspension without pay'], 'ans' => 2, 'exp' => 'Section 11 states penalties include removal from office and perpetual disqualification.'],
                    ]
                ]
            ],
            'verbal-ability-english' => [
                'name' => 'Verbal Ability',
                'slug' => 'verbal-ability',
                'sets' => [
                    'Grammar and Comprehension (Set 1)' => [
                        ['q' => 'Identify the correct sentence:', 'opts' => ['He don\'t know the answer.', 'He doesn\'t know the answer.', 'He isn\'t know the answer.', 'He didn\'t knew the answer.'], 'ans' => 1, 'exp' => 'The third-person singular pronoun "he" takes "doesn\'t" (does not).'],
                        ['q' => 'Neither the manager nor the employees ____ aware of the issue.', 'opts' => ['is', 'are', 'was', 'has been'], 'ans' => 1, 'exp' => 'In "neither/nor" constructions, the verb agrees with the subject closest to it ("employees").'],
                        ['q' => 'What is the synonym of "mitigate"?', 'opts' => ['Worsen', 'Aggravate', 'Alleviate', 'Confuse'], 'ans' => 2, 'exp' => '"Mitigate" means to make less severe or painful, making "alleviate" the correct synonym.'],
                        ['q' => 'The committee ____ submitted its final report.', 'opts' => ['have', 'has', 'are', 'were'], 'ans' => 1, 'exp' => 'Committee acts as a singular collective noun here, taking the singular verb "has".'],
                        ['q' => 'He is known for his ____ approach to solving problems.', 'opts' => ['pragmatic', 'pragmatism', 'pragmatist', 'pragmatically'], 'ans' => 0, 'exp' => 'An adjective is needed to modify "approach," making "pragmatic" correct.'],
                        ['q' => 'Identify the error: "Each of the students have submitted their assignment."', 'opts' => ['Each of', 'the students', 'have submitted', 'their assignment'], 'ans' => 2, 'exp' => '"Each" is a singular pronoun and requires the singular verb "has," not "have."'],
                        ['q' => 'She has been working here ____ 2015.', 'opts' => ['for', 'since', 'from', 'in'], 'ans' => 1, 'exp' => '"Since" is used with a specific point in time (2015).'],
                        ['q' => 'What is the antonym of "ephemeral"?', 'opts' => ['Temporary', 'Transient', 'Permanent', 'Brief'], 'ans' => 2, 'exp' => '"Ephemeral" means lasting for a very short time. "Permanent" is the exact opposite.'],
                        ['q' => 'I would have gone to the party if I ____ the time.', 'opts' => ['have', 'had', 'have had', 'had had'], 'ans' => 3, 'exp' => 'Third conditional structure: if + past perfect ("had had").'],
                        ['q' => 'The CEO, along with the board members, ____ attending the conference.', 'opts' => ['is', 'are', 'have been', 'were'], 'ans' => 0, 'exp' => 'Phrases like "along with" do not change the number of the subject. The subject is "CEO" (singular).'],
                    ]
                ]
            ],
            'verbal-ability-filipino' => [
                'name' => 'Verbal Ability',
                'slug' => 'verbal-ability',
                'sets' => [
                    'Balarila at Talasalitaan (Set 1)' => [
                        ['q' => 'Alin sa mga sumusunod ang tamang baybay?', 'opts' => ['Nakakabahala', 'Nakababahala', 'Nakaka-bahala', 'Naka-kabahala'], 'ans' => 1, 'exp' => 'Sa pag-uulit ng pantig, inuulit ang unang pantig ng salitang-ugat (ba-ha-la), kaya "nakababahala".'],
                        ['q' => 'Pumili ng pinakaangkop na salita: ____ mo ang aklat na iyan sa ibabaw ng mesa.', 'opts' => ['Iwan', 'Iwanan', 'Ewan', 'Ewanan'], 'ans' => 0, 'exp' => '"Iwan" ay ginagamit kapag ang tinutukoy ay ang bagay (aklat). Ang "iwanan" ay para sa tao o lugar.'],
                        ['q' => 'Ano ang kasingkahulugan ng salitang "mabanas"?', 'opts' => ['Maaliwalas', 'Malamig', 'Mainit', 'Maulan'], 'ans' => 2, 'exp' => '"Mabanas" ay nangangahulugang mainit at maalinsangan ang panahon.'],
                        ['q' => '____ mo ba ang pinto bago ka umalis?', 'opts' => ['Sinara', 'Isinara', 'Sinarhan', 'Sinarado'], 'ans' => 1, 'exp' => 'Ang tamang pandiwa para sa pinto ay "isinara" (isara).'],
                        ['q' => 'Tukuyin ang mali: "Siya ay naglakad nang mabilis patungo sa paaralan."', 'opts' => ['Siya ay', 'naglakad nang', 'mabilis', 'Walang mali'], 'ans' => 3, 'exp' => 'Tamang ginamit ang "nang" bilang pang-abay na pamaraan bago ang pang-uring "mabilis".'],
                        ['q' => 'Ano ang kahulugan ng idyomang "balat-sibuyas"?', 'opts' => ['Maputi', 'Maramdamin', 'Mabilis maiyak', 'Manipis ang balat'], 'ans' => 1, 'exp' => 'Ang "balat-sibuyas" ay tumutukoy sa taong mabilis masaktan o maramdamin.'],
                        ['q' => 'Pumili ng tamang pang-ugnay: Nag-aral siyang mabuti, ____ pumasa siya sa pagsusulit.', 'opts' => ['subalit', 'datapwat', 'kaya', 'ngunit'], 'ans' => 2, 'exp' => '"Kaya" ay nagpapakita ng bunga o resulta ng isang aksyon.'],
                        ['q' => '____ raw natin ang mga panuntunan ng patimpalak.', 'opts' => ['Sundin', 'Sundan', 'Susundan', 'Sinundan'], 'ans' => 0, 'exp' => '"Sundin" (obey) ang ginagamit sa mga batas o panuntunan. Ang "sundan" (follow) ay ginagamit sa direksyon o tao.'],
                        ['q' => 'Tukuyin ang salitang-ugat ng "pinag-aralan".', 'opts' => ['Aral', 'Aralan', 'Pag-aral', 'Inaral'], 'ans' => 0, 'exp' => 'Ang salitang-ugat nito ay "aral".'],
                        ['q' => 'Mali ang paggamit ng "daw" sa pangungusap na:', 'opts' => ['Aalis daw sila bukas.', 'Masarap daw ang pagkain.', 'Bibili daw siya ng kotse.', 'Wala daw silang alam.'], 'ans' => 3, 'exp' => 'Kapag ang sinusundang salita ay nagtatapos sa patinig, ginagamit ang "raw". Ang "Wala" ay nagtatapos sa "a", kaya dapat ay "Wala raw".'],
                    ]
                ]
            ],
        ];

        DB::beginTransaction();

        try {
            foreach ($testBank as $subjectName => $subjectData) {
                $subjectName = $subjectData['name'] ?? $subjectName;

                // Fetch or Create the Subject
                $subject = Subject::firstOrCreate(
                    ['slug' => $subjectData['slug']],
                    ['name' => $subjectName]
                );

                foreach ($subjectData['sets'] as $setName => $questions) {
                    $orderIndex = 1;

                    // Fetch or Create the Quiz Set
                    $quizSet = QuizSet::firstOrCreate(
                        [
                            'subject_id' => $subject->id,
                            'name' => $setName
                        ],
                        [
                            'order_index' => $orderIndex,
                            'difficulty' => $difficultyForOrder($orderIndex),
                        ]
                    );

                    if ($quizSet->difficulty !== $difficultyForOrder((int) $quizSet->order_index)) {
                        $quizSet->difficulty = $difficultyForOrder((int) $quizSet->order_index);
                        $quizSet->save();
                    }

                    // If quiz set already has questions, skip insertion to prevent doubling data on re-seed
                    if ($quizSet->questions()->exists()) {
                        continue;
                    }

                    foreach ($questions as $qData) {
                        $question = Question::create([
                            'quiz_set_id' => $quizSet->id,
                            'question_text' => $qData['q'],
                            'explanation' => $qData['exp']
                        ]);

                        foreach ($qData['opts'] as $idx => $optText) {
                            Answer::create([
                                'question_id' => $question->id,
                                'answer_text' => $optText,
                                'is_correct' => ($idx === $qData['ans'])
                            ]);
                        }
                    }
                }
            }

            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }
}
