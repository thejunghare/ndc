//classs
class User {
  constructor(name) {
    this.name = name;
  }

  //get name(){ return this._name}
  // set name(vlaue){this._name = value}

  sayHi() {
    console.log(this.name);
  }
}

// Inhertiance
class Prasad extends User {}

let prasad = new Prasad("arohi");
prasad.sayHi();

let user = new User("Prasad");
user.sayHi(); // Prasad

console.log(typeof User); // function

// classes using function
function classAsFunction(name) {
  this.name = name;

  classAsFunction.prototype.sayHello = function () {
    console.log(this.name);
  };
}

let userone = new classAsFunction("paddy");
userone.sayHello();

//promise
let promise = new Promise(function (resolve, reject) {
  //  resolve("done");

  reject(new Error("error")); // ignore
});

promise
  .then((result) => console.log(result))
  .catch((error) => console.log(error.message));

new Promise((resolve, reject) => {
  throw new Error("error fu");
}).catch(console.log(error.message));

// async/ await
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchData() {
  console.log("Fetching data...");

  await delay(2000); // waits for 2 seconds

  console.log("Data received!");
}

fetchData();

async function fetchUser() {
  try {
    const response = await fetch(
      "https://jsonplaceholder.typicode.com/users/1",
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const user = await response.json();
    console.log("User Name:", user.name);
    console.log("Email:", user.email);
  } catch (error) {
    console.error("Failed to fetch user:", error.message);
  }
}

fetchUser();

function* generateSequence() {
  yield 1;
  yield 2;
  return 3;
}

let generator = generateSequence();

for(let value of generator) {
  alert(value); // 1, then 2
}

// 📁 sayHi.js
export function sayHi(user) {
  alert(`Hello, ${user}!`);
}
…Then another file may import and use it:

// 📁 main.js
import {sayHi} from './sayHi.js';

alert(sayHi); // function...
sayHi('John'); // Hello, John!
