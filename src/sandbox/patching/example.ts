class Original {
  name: string;
  constructor(name: string) {
    this.name = name;
  }

  greet() {
    console.log(`Hello, my name is ${this.name}`);
  }
}

class Patched {
  name: string;
  constructor(name: string) {
    this.name = 'Patched ' + name;
  }

  greet() {
    console.log(`Hello, mi name is ${this.name}`);
  }
}

const o = new Original('Original');

const oldGreet = Original.prototype.greet;
Original.prototype.greet = () => {
  console.log('WAT');
  return oldGreet();
};

o.greet();

// // Save the prototype of the Original class
// const originalProto = Original.prototype;

// // Replace the constructor of Original with the constructor of Patched
// Original = function () {
//   Patched.apply(this, arguments);
// };

// // Restore the prototype of Original and update the constructor reference
// Original.prototype = originalProto;
// Original.prototype.constructor = Original;

// // Now when we create an instance of Original, it will use the constructor of Patched
// let patchedInstance = new Original('Original');
// patchedInstance.greet(); // This will still output: Hello, my name is Original
