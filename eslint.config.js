import js from '@eslint/js'
import pluginVue from 'eslint-plugin-vue'
import vueParser from 'vue-eslint-parser'
import prettier from 'eslint-config-prettier'

export default [
  js.configs.recommended,
  {
    ignores: [
      '**/node_modules/**',
      '**/.vitepress/cache/**',
      '**/.vitepress/dist/**',
      '**/dist/**',
      '**/coverage/**'
    ]
  },
  // Vue files configuration
  {
    files: ['**/*.vue'],
    plugins: {
      vue: pluginVue
    },
    languageOptions: {
      parser: vueParser,
      globals: {
        console: 'readonly',
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        localStorage: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        requestAnimationFrame: 'readonly',
        cancelAnimationFrame: 'readonly',
        EventTarget: 'readonly',
        CustomEvent: 'readonly',
        ResizeObserver: 'readonly',
        crypto: 'readonly'
      }
    },
    rules: {
      ...pluginVue.configs.recommended.rules,
      'no-console': 'off',
      'no-debugger': 'warn',
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'vue/max-attributes-per-line': ['warn', {
        singleline: 3,
        multiline: 1
      }],
      'vue/no-v-html': 'off',
      'vue/require-default-prop': 'off',
      'vue/require-explicit-emits': 'off',
      'vue/attributes-order': 'warn',
      'no-empty': 'warn'
    }
  },
  // JavaScript files configuration
  {
    files: ['**/*.js', '**/*.mjs'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        console: 'readonly',
        process: 'readonly',
        __dirname: 'readonly',
        Buffer: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        localStorage: 'readonly',
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        fetch: 'readonly',
        caches: 'readonly',
        self: 'readonly',
        URL: 'readonly',
        location: 'readonly',
        Response: 'readonly',
        EventTarget: 'readonly',
        CustomEvent: 'readonly',
        IntersectionObserver: 'readonly',
        Element: 'readonly',
        SVGElement: 'readonly',
        HTMLElement: 'readonly',
        matchMedia: 'readonly',
        requestAnimationFrame: 'readonly',
        cancelAnimationFrame: 'readonly',
        require: 'readonly',
        global: 'readonly',
        vi: 'readonly',
        describe: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        test: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly'
      }
    },
    rules: {
      'no-console': 'off',
      'no-debugger': 'warn',
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'no-empty': 'warn',
      'no-case-declarations': 'error'
    }
  },
  // CommonJS files
  {
    files: ['**/*.cjs'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'script',
      globals: {
        console: 'readonly',
        process: 'readonly',
        __dirname: 'readonly',
        Buffer: 'readonly',
        require: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly'
      }
    },
    rules: {
      'no-console': 'off',
      'no-debugger': 'warn',
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'no-empty': 'warn'
    }
  },
  prettier,
  {
    files: ['**/*.test.js', '**/*.spec.js'],
    rules: {
      'no-undef': 'off',
      'no-unused-vars': 'off'
    }
  }
]
