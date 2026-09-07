import ts from 'typescript-eslint';
export default ts.config({ignores:['**/dist/**','**/node_modules/**','artifacts/**']},...ts.configs.recommended,{files:['**/*.ts'],rules:{'@typescript-eslint/no-explicit-any':'error'}});
