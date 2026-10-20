import eslint from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import betterTailwindcss from 'eslint-plugin-better-tailwindcss';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import reactHooks from 'eslint-plugin-react-hooks';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import globals from 'globals';
import tseslint from 'typescript-eslint';

// ひらがな・カタカナ・漢字・全角の記号。画面の文言が copy.ts の外に書かれていないかを見る
const JAPANESE_CHARACTER = '[\\u3040-\\u30ff\\u3400-\\u9fff\\uff01-\\uff9f]';

// patterns は gitignore の文法で評価され、親が一致すれば子も一致する。1 段で features/<name>/ 配下を深さに関わらず拾える
const FEATURE_INTERNAL_PATHS = ['@/features/*/*'];

const SHARED_RESTRICTED_IMPORTS = {
  paths: [
    {
      name: 'react',
      importNames: ['useMemo', 'useCallback', 'memo'],
      message: 'React Compiler が有効なので手で memo 化しない。再描画の問題は状態の設計で直す',
    },
  ],
  patterns: [
    {
      group: FEATURE_INTERNAL_PATHS,
      message: 'feature の内部は import しない。公開されているものは @/features/<name> (index.ts) から取る',
    },
  ],
};

// 依存の向きは lib → data → components → features → app の一方向。左は右を import しない。
// 層をまたぐ import は @/ の別名で書く前提で見る (相対パスで層をまたぐ書き方は規約で禁じ、ここでは追わない)
function restrictImports(patterns) {
  return [
    'error',
    {
      paths: SHARED_RESTRICTED_IMPORTS.paths,
      patterns: [...SHARED_RESTRICTED_IMPORTS.patterns, ...patterns],
    },
  ];
}

const UPPER_LAYERS = {
  app: { group: ['@/app', '@/app/*'], message: 'app は配線だけを持つ。下の層から app を import しない' },
  features: { group: ['@/features/*'], message: 'feature 同士と、features より下の層から feature を import しない' },
  components: { group: ['@/components/*'], message: 'lib と data は UI に依存しない' },
  data: { group: ['@/data', '@/data/*'], message: 'lib は保存文書に依存しない' },
  copy: { group: ['@/copy'], message: '画面の文言は部品で使う。lib と data は英語のエラーだけを返す' },
  react: { group: ['react', 'react-dom', 'react-dom/*'], message: 'lib と data は React に依存しない' },
};

// 変数に型注釈を付けたアロー (`const f: StateCreator<T> = ...`) は対象外。function 宣言には関数型を丸ごと当てる構文がない
const FUNCTION_STYLE_RESTRICTED_SYNTAX = [
  {
    selector: 'Program > VariableDeclaration > VariableDeclarator:not([id.typeAnnotation]) > ArrowFunctionExpression',
    message: 'トップレベルの関数は function 宣言で書く',
  },
  {
    selector:
      'Program > ExportNamedDeclaration > VariableDeclaration > VariableDeclarator:not([id.typeAnnotation]) > ArrowFunctionExpression',
    message: 'トップレベルの関数は function 宣言で書く',
  },
  {
    selector: ':function FunctionDeclaration',
    message: '関数の中のローカル関数はアロー関数で書く',
  },
];

const EXPORT_RESTRICTED_SYNTAX = [
  { selector: 'ExportDefaultDeclaration', message: '名前つき export だけを使う' },
  { selector: 'ExportAllDeclaration', message: 'export * を使わない。公開するものを名前で並べる' },
];

const TYPE_ASSERTION_RESTRICTED_SYNTAX = [
  {
    selector: 'TSAsExpression:not([typeAnnotation.typeName.name="const"])',
    message: 'as で型を曲げない。型か設計を直す (as const は可)',
  },
];

const JAPANESE_LITERAL_RESTRICTED_SYNTAX = [
  { selector: `Literal[value=/${JAPANESE_CHARACTER}/]`, message: '画面の文言は src/copy.ts に置く' },
  { selector: `TemplateElement[value.raw=/${JAPANESE_CHARACTER}/]`, message: '画面の文言は src/copy.ts に置く' },
  { selector: `JSXText[value=/${JAPANESE_CHARACTER}/]`, message: '画面の文言は src/copy.ts に置く' },
];

export default tseslint.config(
  {
    ignores: ['dist/**', 'coverage/**', 'node_modules/**'],
  },

  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  reactHooks.configs.flat.recommended,
  jsxA11y.flatConfigs.recommended,

  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.es2023,
      },
      parserOptions: {
        projectService: true,
      },
    },
    plugins: {
      'simple-import-sort': simpleImportSort,
    },
    rules: {
      '@typescript-eslint/consistent-type-definitions': ['error', 'type'],
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports', disallowTypeAnnotations: true },
      ],
      '@typescript-eslint/no-non-null-assertion': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { vars: 'all', args: 'after-used', ignoreRestSiblings: true }],
      '@typescript-eslint/restrict-template-expressions': [
        'error',
        { allowAny: false, allowBoolean: false, allowNullish: false, allowNumber: true, allowRegExp: false },
      ],
      // default があっても union の漏れは拾い、非 union には既定の分岐を求める
      '@typescript-eslint/switch-exhaustiveness-check': [
        'error',
        {
          allowDefaultCaseForExhaustiveSwitch: true,
          requireDefaultForNonUnion: true,
          considerDefaultExhaustiveForUnions: false,
        },
      ],
      'no-restricted-imports': 'off',
      '@typescript-eslint/no-restricted-imports': restrictImports([]),
      'no-restricted-syntax': [
        'error',
        ...FUNCTION_STYLE_RESTRICTED_SYNTAX,
        ...EXPORT_RESTRICTED_SYNTAX,
        ...TYPE_ASSERTION_RESTRICTED_SYNTAX,
      ],

      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',

      'no-console': ['warn', { allow: ['info', 'warn', 'error'] }],
      'no-param-reassign': 'error',
      'max-depth': ['error', 3],
      eqeqeq: ['error', 'always', { null: 'ignore' }],
    },
  },

  // 画面の文言は copy.ts に集める。テストの名前は日本語の文なので対象外
  {
    files: ['src/**/*.{ts,tsx}'],
    ignores: ['src/copy.ts', 'src/**/*.test.{ts,tsx}'],
    rules: {
      'no-restricted-syntax': [
        'error',
        ...FUNCTION_STYLE_RESTRICTED_SYNTAX,
        ...EXPORT_RESTRICTED_SYNTAX,
        ...TYPE_ASSERTION_RESTRICTED_SYNTAX,
        ...JAPANESE_LITERAL_RESTRICTED_SYNTAX,
      ],
    },
  },

  // 依存の向き (層ごとに禁止する import を足す。同名の規則は後勝ちで丸ごと置き換わるので、共通分も含めて渡す)
  {
    files: ['src/lib/**'],
    rules: {
      '@typescript-eslint/no-restricted-imports': restrictImports([
        UPPER_LAYERS.react,
        UPPER_LAYERS.copy,
        UPPER_LAYERS.data,
        UPPER_LAYERS.components,
        UPPER_LAYERS.features,
        UPPER_LAYERS.app,
      ]),
    },
  },
  {
    files: ['src/data/**'],
    rules: {
      '@typescript-eslint/no-restricted-imports': restrictImports([
        UPPER_LAYERS.react,
        UPPER_LAYERS.copy,
        UPPER_LAYERS.components,
        UPPER_LAYERS.features,
        UPPER_LAYERS.app,
      ]),
    },
  },
  {
    files: ['src/components/**'],
    rules: {
      '@typescript-eslint/no-restricted-imports': restrictImports([UPPER_LAYERS.features, UPPER_LAYERS.app]),
    },
  },
  {
    files: ['src/features/**'],
    rules: {
      '@typescript-eslint/no-restricted-imports': restrictImports([UPPER_LAYERS.features, UPPER_LAYERS.app]),
    },
  },

  // Tailwind のクラス。整形と並び順は Prettier のプラグインに任せ、ここでは正しさだけを見る
  {
    files: ['src/**/*.tsx'],
    plugins: {
      'better-tailwindcss': betterTailwindcss,
    },
    settings: {
      'better-tailwindcss': {
        entryPoint: 'src/app/index.css',
      },
    },
    rules: {
      ...betterTailwindcss.configs.correctness.rules,
      'better-tailwindcss/no-restricted-classes': [
        'error',
        {
          restrict: [
            {
              pattern: '\\[([^\\[\\]]*?)\\](?!:)',
              message: '生の値 ($1) を書かない。トークンにない値が要るときは、まずトークンを疑う',
            },
          ],
        },
      ],
    },
  },

  // 設定ファイルは道具が default export を要求する
  {
    files: ['*.config.{js,ts}'],
    rules: {
      'no-restricted-syntax': ['error', ...FUNCTION_STYLE_RESTRICTED_SYNTAX, ...TYPE_ASSERTION_RESTRICTED_SYNTAX],
    },
  },
  {
    files: ['**/*.js'],
    extends: [tseslint.configs.disableTypeChecked],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },

  eslintConfigPrettier,
);
