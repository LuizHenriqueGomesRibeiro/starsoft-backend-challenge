module.exports = {
  types: [
    { value: 'feat', name: 'feat:     Uma nova funcionalidade' },
    { value: 'fix', name: 'fix:      Correção de um erro' },
    { value: 'chore', name: 'chore:    Configurações e ferramentas' },
    { value: 'docs', name: 'docs:     Documentação' },
  ],
  skipQuestions: ['scope', 'body', 'footer', 'breaking'],
  messages: {
    type: "Selecione o tipo de alteração que você está enviando:",
    subject: "Escreva uma descrição curta e direta:\n",
    confirmCommit: "Tem certeza que deseja prosseguir com o commit acima?",
  },
  
  subjectLimit: 100,
};