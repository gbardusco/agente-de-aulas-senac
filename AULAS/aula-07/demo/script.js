// ===== DEMONSTRAÇÃO — Aula 07: JavaScript Básico =====

// 1. Console.log — mostrando valores
console.log("Olá, mundo!");
console.log("Bem-vindo à aula de JavaScript!");

// 2. Variáveis
let temperatura = 25;
let umidade = 60;
let nomeAluno = "Maria";
let sensorAtivo = true;

const LIMITE_TEMPERATURA = 40;

console.log("Temperatura atual:", temperatura, "°C");
console.log("Umidade:", umidade, "%");
console.log("Aluno:", nomeAluno);
console.log("Sensor ativo?", sensorAtivo);

// 3. Operações aritméticas
let soma = temperatura + 5;
let media = (temperatura + umidade) / 2;

console.log("Temperatura + 5 =", soma);
console.log("Média temp/umidade =", media);

// 4. Comparações
console.log("Temperatura > 30?", temperatura > 30);
console.log("Temperatura === 25?", temperatura === 25);
console.log("Temperatura > LIMITE?", temperatura > LIMITE_TEMPERATURA);

// 5. Interação com o usuário
let nome = prompt("Qual é o seu nome?");
alert("Olá, " + nome + "! Bem-vindo ao Painel IoT!");
console.log("Usuário digitou:", nome);

// 6. Conversão de tipo
let tempDigitada = prompt("Digite uma temperatura em Celsius:");
let tempNumero = Number(tempDigitada);
let fahrenheit = tempNumero * 9/5 + 32;

console.log(tempNumero + "°C = " + fahrenheit + "°F");
alert(tempNumero + "°C equivale a " + fahrenheit + "°F");
