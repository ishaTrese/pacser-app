<?php

return [
    'aliases' => [
        'professional' => 'professional',
        'subprofessional' => 'sub-professional',
        'sub-professional' => 'sub-professional',
        'sub_professional' => 'sub-professional',
    ],

    'levels' => [
        'professional' => [
            'label' => 'Professional',
            'subjects' => [
                'numerical-ability',
                'analytical-ability',
                'verbal-ability',
                'general-information',
            ],
            'mock_exam_allocation' => [
                'numerical-ability' => 43,
                'analytical-ability' => 43,
                'verbal-ability' => 42,
                'general-information' => 42,
            ],
        ],

        'sub-professional' => [
            'label' => 'Sub-Professional',
            'subjects' => [
                'numerical-ability',
                'clerical-ability',
                'verbal-ability',
                'general-information',
            ],
            'mock_exam_allocation' => [
                'numerical-ability' => 42,
                'clerical-ability' => 41,
                'verbal-ability' => 41,
                'general-information' => 41,
            ],
        ],
    ],
];
