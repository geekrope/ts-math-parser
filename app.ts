enum OperatorPrecedence {
	First, Second, Third
}

interface Func {
	(value: (number | boolean)[]): number | boolean;
}

class Extensions {
	public static split(value: string, ...separators: string[]): string[] {
		let split: string[] = [];
		let lastIndex = 0;
		for (let index = 0; index < value.length; index++) {
			for (let index2 = 0; index2 < separators.length; index2++) {
				if (index + separators[index2].length <= value.length) {
					let substr = value.substr(index, separators[index2].length);
					if (substr == separators[index2]) {
						if (lastIndex != index) {
							split.push(value.substring(lastIndex, index));
						}
						lastIndex = index + 1;
					}
				}
			}
		}
		if (lastIndex < value.length) {
			split.push(value.substring(lastIndex));
		}
		return split;
	}
	public static replaceAll(searchValue: string, replaceValue: string, value: string): string {
		let index = value.indexOf(searchValue);
		while (index != -1) {
			value = Extensions.replace(value, index, index + searchValue.length, replaceValue);
			index = value.indexOf(searchValue);
		}
		return value;
	}
	public static replace(value: string, start: number, end: number, replaceValue: string): string {
		return value.substring(0, start) + replaceValue + value.substr(end);
	}
}

class Operand {
	public readonly Value: number | boolean | Parameter | ArgumentArray | UnaryOperation | BinaryOperation;
	public constructor(value: number | boolean | Parameter | ArgumentArray | UnaryOperation | BinaryOperation) {
		this.Value = value;
	}
}

class Parameter {
	public readonly Name: string;
	public Value: number | boolean;
	public constructor(name: string, value: number | boolean) {
		this.Name = name;
		this.Value = value;
	}
}

class Operator {
	public readonly Value: string;
	public readonly OperatorLevel: OperatorPrecedence;
	public constructor(value: string, operatorLevel: OperatorPrecedence) {
		this.Value = value;
		this.OperatorLevel = operatorLevel;
	}
}

class BinaryOperation {
	public readonly FirstOperand: Operand;
	public readonly SecondOperand: Operand;
	public readonly Operator: Operator;
	public constructor(firstOperand: Operand, secondOperand: Operand, oper: Operator) {
		this.FirstOperand = firstOperand;
		this.SecondOperand = secondOperand;
		this.Operator = oper;
	}
}

class UnaryOperation {
	public readonly Arguments: ArgumentArray;
	public readonly Func: MathFunction;
	public constructor(argument: ArgumentArray, func: MathFunction) {
		this.Arguments = argument;
		this.Func = func;
	}
}

class ArgumentArray {
	public readonly Arguments: Operand[];
	public get Length(): number {
		return this.Arguments.length;
	}
	public constructor(argument: Operand[]) {
		this.Arguments = argument;
	}
}

class MathFunction {
	public readonly Type: string;
	public readonly ArgumentsCount: number;
	public readonly Func: Func;
	public constructor(type: string, argsCount: number, func: Func) {
		this.Type = type;
		this.ArgumentsCount = argsCount;
		this.Func = func;
	}
}

class MathParser {
	public static readonly Operators: Operator[] = [
		new Operator("+", OperatorPrecedence.First),
		new Operator("-", OperatorPrecedence.First),

		new Operator("|", OperatorPrecedence.First),
		new Operator("&", OperatorPrecedence.First),

		new Operator("*", OperatorPrecedence.Second),
		new Operator("%", OperatorPrecedence.Second),
		new Operator("/", OperatorPrecedence.Second),

		new Operator(">", OperatorPrecedence.Second),
		new Operator("<", OperatorPrecedence.Second),

		new Operator(">=", OperatorPrecedence.Second),
		new Operator("<=", OperatorPrecedence.Second),
		new Operator("==", OperatorPrecedence.Second),
		new Operator("!=", OperatorPrecedence.Second),

		new Operator("^", OperatorPrecedence.Third),
	];

	public static readonly OperandKey: string = "#";

	public static readonly Enumerator: string = ";";

	public static readonly Constants: Parameter[] = [new Parameter("pi", Math.PI), new Parameter("e", Math.E), new Parameter("false", false), new Parameter("true", true), new Parameter("infinity", Number.POSITIVE_INFINITY)];

	public static readonly NegativeFunction: MathFunction = new MathFunction("negative", 1, (value: (number | boolean)[]) => { return -<number>value[0]; });

	public static readonly Functions: MathFunction[] = [
		new MathFunction("rad", 1, (value: (number | boolean)[]) => { return <number>value[0] / 180.0 * Math.PI; }),
		new MathFunction("deg", 1, (value: (number | boolean)[]) => { return <number>value[0] * 180.0 / Math.PI; }),

		new MathFunction("cos", 1, (value: (number | boolean)[]) => { return Math.cos(<number>value[0]); }),
		new MathFunction("sin", 1, (value: (number | boolean)[]) => { return Math.sin(<number>value[0]); }),
		new MathFunction("tan", 1, (value: (number | boolean)[]) => { return Math.sin(<number>value[0]) / Math.cos(<number>value[0]); }),
		new MathFunction("cot", 1, (value: (number | boolean)[]) => { return Math.cos(<number>value[0]) / Math.sin(<number>value[0]); }),

		new MathFunction("acos", 1, (value: (number | boolean)[]) => { return Math.acos(<number>value[0]); }),
		new MathFunction("asin", 1, (value: (number | boolean)[]) => { return Math.asin(<number>value[0]); }),
		new MathFunction("atan", 1, (value: (number | boolean)[]) => { return Math.atan(<number>value[0]); }),
		new MathFunction("acot", 1, (value: (number | boolean)[]) => { return Math.atan(1 / <number>value[0]); }),

		new MathFunction("sqrt", 1, (value: (number | boolean)[]) => { return Math.sqrt(<number>value[0]); }),
		new MathFunction("cbrt", 1, (value: (number | boolean)[]) => { return Math.pow(<number>value[0], 1.0 / 3.0); }),

		new MathFunction("ln", 1, (value: (number | boolean)[]) => { return Math.log(<number>value[0]); }), //log(x)_e
		new MathFunction("abs", 1, (value: (number | boolean)[]) => { return Math.abs(<number>value[0]); }),

		new MathFunction("!", 1, (value: (number | boolean)[]) => { return !<boolean>value[0]; }),

		new MathFunction("rand", 2, (value: (number | boolean)[]) => { return Math.random() * (<number>value[1] - <number>value[0]) + <number>value[0]; }),

		new MathFunction("log", 2, (value: (number | boolean)[]) => { return Math.log(<number>value[0]) / Math.log(<number>value[1]) }),
		new MathFunction("root", 2, (value: (number | boolean)[]) => { return Math.pow(<number>value[0], 1 / <number>value[1]) }),
	];

	private static IsBasicOperator(value: string): boolean {
		let result = false;
		MathParser.Operators.forEach((oper) => {
			if (!result) {
				result = oper.Value == value;
			}
		});
		return result;
	}

	private static CalculateOperators(expression: string, operands: Operand[]): { operands: Operand[], expression: string } {
		let split = Extensions.split(expression, MathParser.OperandKey);

		let calculate = (oper: string) => {
			let sign = 1;
			for (let index = oper.length - 1; !MathParser.IsBasicOperator(oper); index--) {
				if (oper[index] == '-') {
					sign = -sign;
					oper = oper.substr(0, oper.length);
				}
				else {
					throw new Error(`Incorrect operator: ${oper}`);
				}
			}
			return oper[0].toString() + (sign == -1 ? "-" : "");
		};

		for (let token = 0; token < split.length; token++) {
			if (!isNaN(Number(split[token]))) {
				split[token] = `${MathParser.OperandKey}${parseInt(split[token])}${MathParser.OperandKey}`;
			}
			else {
				let oper = calculate(split[token]);
				let operandIndex = parseInt(split[token + 1]);

				if (token == 0) {
					split[token] = "";

					if (oper == "-") {
						operands[operandIndex] = new Operand(new UnaryOperation(new ArgumentArray([operands[operandIndex]]), MathParser.NegativeFunction));
					}

					// -- = + => split[token]=""

					else if (oper != "--") {
						throw new Error(`Can't parse operator: ${split[token]}`);
					}
				}
				else {
					if (!MathParser.IsBasicOperator(split[token])) {
						split[token] = oper[0].toString();

						if (oper.length > 1 && oper[1] == '-') {
							operands[operandIndex] = new Operand(new UnaryOperation(new ArgumentArray([operands[operandIndex]]), MathParser.NegativeFunction));
						}
					}
				}
			}
		}

		return { operands: operands, expression: split.join("") };
	}

	private static GetOperands(expression: string, parameters?: Parameter[], addedOperands?: Operand[]): { operands: Operand[], expression: string } {
		let operands: Operand[] = [];

		if (addedOperands != null) {
			operands = operands.concat(addedOperands);
		}

		let lastIndex = 0;

		let operators: string[] = [];
		MathParser.Operators.forEach((oper) => {
			operators.push(oper.Value);
		});

		let addOperand = (start: number, end: number) => {
			let operand = expression.substring(start, end);
			if (operand.length > 0) {
				if (operand[0].toString() == MathParser.OperandKey && operand[operand.length - 1].toString() == MathParser.OperandKey) {
					return start + operand.length;
				}
				else {
					let replaceValue = `${MathParser.OperandKey}${operands.length}${MathParser.OperandKey}`;
					expression = Extensions.replace(expression, lastIndex, end, replaceValue);
					operands.push(MathParser.ParseOperand(operand, parameters, operands));
					return start + replaceValue.length;
				}
			}
			else {
				return -1;
			}
		};

		for (let index = 0; index < expression.length; index++) {
			let currentOperator = "";

			operators.forEach((oper) => {
				if (index + oper.length <= expression.length && oper.length > currentOperator.length) {
					let subExpression = expression.substr(index, oper.length);
					if (subExpression == oper) {
						currentOperator = oper;
					}
				}
			});


			if (currentOperator != "") {
				let currentIndex = addOperand(lastIndex, index);
				index = currentIndex == -1 ? index : currentIndex;
				lastIndex = index + currentOperator.length;
			}
		}

		addOperand(lastIndex, expression.length);

		return { operands: operands, expression: expression };
	}

	private static GroupBinaryOperations(expression: string, operands: Operand[], level: OperatorPrecedence): { operands: Operand[], expression: string } {
		let split = Extensions.split(expression, MathParser.OperandKey);

		let operators: Operator[] = [];
		MathParser.Operators.forEach((oper) => {
			if (level == oper.OperatorLevel) {
				operators.push(oper);
			}
		});

		for (let token = 1; token < split.length - 1;) {
			let currentOperator: Operator | undefined;

			operators.forEach((oper) => {
				if (oper.Value == split[token]) {
					currentOperator = oper;
				}
			});

			if (currentOperator !== undefined) {
				let firstOperandIndex = parseInt(split[token - 1]);
				let secondOperandIndex = parseInt(split[token + 1]);
				let expressionToReplace = `${MathParser.OperandKey}${firstOperandIndex}${MathParser.OperandKey}${currentOperator.Value}${MathParser.OperandKey}${secondOperandIndex}${MathParser.OperandKey}`;

				operands.push(new Operand(new BinaryOperation(operands[firstOperandIndex], operands[secondOperandIndex], currentOperator)));

				expression = Extensions.replaceAll(expressionToReplace, `${MathParser.OperandKey}${operands.length - 1}${MathParser.OperandKey}`, expression);

				token = 1;
				split = Extensions.split(expression, MathParser.OperandKey);
			}
			else {
				token++;
			}
		}

		return { operands: operands, expression: expression };
	}

	private static SplitExpression(expression: string, parameters?: Parameter[], operands?: Operand[]): Operand {
		let calculatedOperands = MathParser.GetOperands(expression, parameters, operands);

		let calculatedOperators = MathParser.CalculateOperators(calculatedOperands.expression, calculatedOperands.operands);

		let thirdLevel = MathParser.GroupBinaryOperations(calculatedOperators.expression, calculatedOperators.operands, OperatorPrecedence.Third);
		let secondLevel = MathParser.GroupBinaryOperations(thirdLevel.expression, thirdLevel.operands, OperatorPrecedence.Second);
		let firstLevel = MathParser.GroupBinaryOperations(secondLevel.expression, secondLevel.operands, OperatorPrecedence.First);

		return firstLevel.operands[MathParser.ParseOperandIndex(firstLevel.expression)];
	}

	private static ParseOperand(operand: string, parameters?: Parameter[], addedOperands?: Operand[]): Operand {
		let allParameters = MathParser.GetParameters(parameters);

		if (!isNaN(Number(operand))) {
			return new Operand(parseFloat(operand));
		}
		else if (operand[0].toString() == MathParser.OperandKey && operand[operand.length - 1].toString() == MathParser.OperandKey) {
			if (!addedOperands) {
				throw new Error("addedOperands is not defined");
			}
			return addedOperands[MathParser.ParseOperandIndex(operand)];
		}
		else if (allParameters.has(operand)) {
			return new Operand(allParameters.get(operand)!);
		}
		else if (operand.indexOf(MathParser.Enumerator) != -1) {
			let args = Extensions.split(operand, MathParser.Enumerator);
			let operands: Operand[] = [];

			for (let index = 0; index < args.length; index++) {
				operands.push(MathParser.SplitExpression(args[index], parameters, addedOperands));
			}

			return new Operand(new ArgumentArray(operands));
		}
		else {
			let returnValue: Operand | undefined;

			MathParser.Functions.forEach((func) => {
				if (func.Type.length < operand.length && operand.substr(0, func.Type.length) == func.Type) {
					let innerExpression = operand.substr(func.Type.length, operand.length - func.Type.length);

					let funcExists = false;

					MathParser.Functions.forEach((checkFunction) => {
						if (checkFunction.Type.length < innerExpression.length && innerExpression.substr(0, checkFunction.Type.length) == checkFunction.Type) {
							funcExists = true;
						}
					});

					if (!funcExists) {
						let value = MathParser.ParseOperand(innerExpression, parameters, addedOperands);
						if (value.Value instanceof ArgumentArray) {
							if (value.Value.Length != func.ArgumentsCount) {
								throw new Error(`Function doesn't take ${value.Value.Length} arguments`);
							}
							else {
								returnValue = new Operand(new UnaryOperation(value.Value, func));
							}
						}
						else if (1 != func.ArgumentsCount) {
							throw new Error("Function doesn't take 1 argument");
						}
						else {
							returnValue = new Operand(new UnaryOperation(new ArgumentArray([value]), func));
						}
					}
					else {
						throw new Error(`Function ${func.Type} is already exists`);
					}
				}
			});

			if (returnValue !== undefined) {
				return returnValue;
			}
			else {
				throw new Error(`MathParser.Functions.length == 0. Logical error`);
			}
		}
	}

	private static GetParameters(parameters?: Parameter[]): Map<string, Parameter> {
		let output: Map<string, Parameter> = new Map<string, Parameter>();

		MathParser.Constants.forEach((constant) => {
			output.set(constant.Name, constant);
		});

		if (parameters != null) {
			parameters.forEach((parameter) => {
				if (!output.has(parameter.Name)) {
					output.set(parameter.Name, parameter);
				}
				else {
					throw new Error(`Double parameter ${parameter.Name} declaration`);
				}
			});
		}

		return output;
	}

	private static ParseOperandIndex(operand: string): number {
		return parseInt(Extensions.replaceAll(MathParser.OperandKey, "", operand));
	}

	private static OpenBraces(expression: string, parameters?: Parameter[]): { operands: Operand[], expression: string } {
		let operands: Operand[] = [];

		for (; expression.indexOf("(") != -1;) {
			let expressionLast = expression;
			let maxBracesCount = 0;
			let bracesCount = 0;
			let currentOpenIndex = 0;
			let openIndex = -1;
			let closeIndex = -1;

			for (let index = 0; index < expression.length; index++) {
				if (expression[index] == '(') {
					bracesCount++;
					currentOpenIndex = index;
				}
				if (expression[index] == ')') {
					if (bracesCount > maxBracesCount) {
						openIndex = currentOpenIndex;
						closeIndex = index;
						maxBracesCount = bracesCount;
					}
					bracesCount = 0;
				}
			}

			let expressionToEvaluate = expression.substr(openIndex + 1, closeIndex - (openIndex + 1));
			let expressionToReplace = "(" + expressionToEvaluate + ")";

			if (expressionToEvaluate.indexOf(MathParser.Enumerator) != -1) //function args
			{
				let resultOperand = MathParser.ParseOperand(expressionToEvaluate, parameters, operands);
				operands.push(resultOperand);
			}
			else //inner expression
			{
				let resultOperand = MathParser.SplitExpression(expressionToEvaluate, parameters, operands);
				operands.push(resultOperand);
			}

			expression = Extensions.replaceAll(expressionToReplace, `${MathParser.OperandKey}${operands.length - 1}${MathParser.OperandKey}`, expression);

			if (expressionLast == expression) {
				throw new Error(`Can't open braces in: ${expression}`);
			}
		}

		return { operands: operands, expression: expression };
	}

	public static Parse(expression: string, parameters?: Parameter[]): Operand {
		expression = expression.replace(/\s/gi, "").replace(/\,/gi, ".");

		let openedBraces = MathParser.OpenBraces(expression, parameters);

		return MathParser.SplitExpression(openedBraces.expression, parameters, openedBraces.operands);
	}

	public static Evaluate(operation: BinaryOperation): number | boolean {
		let firstOperand = MathParser.EvaluateOperand(operation.FirstOperand);
		let secondOperand = MathParser.EvaluateOperand(operation.SecondOperand);

		switch (operation.Operator.Value) {
			case "-":
				return <number>firstOperand - <number>secondOperand;
			case "+":
				return <number>firstOperand + <number>secondOperand;
			case "*":
				return <number>firstOperand * <number>secondOperand;
			case "/":
				return <number>firstOperand / <number>secondOperand;
			case "%":
				return <number>firstOperand % <number>secondOperand;
			case "^":
				return Math.pow(<number>firstOperand, <number>secondOperand);
			case "&":
				return <boolean>firstOperand && <boolean>secondOperand;
			case "|":
				return <boolean>firstOperand || <boolean>secondOperand;
			case ">":
				return <number>firstOperand > <number>secondOperand;
			case "<":
				return <number>firstOperand < <number>secondOperand;
			case "ge":
			case ">=":
				return <number>firstOperand >= <number>secondOperand;
			case "le":
			case "<=":
				return <number>firstOperand <= <number>secondOperand;
			case "==":
				return <number>firstOperand == <number>secondOperand;
			case "!=":
				return <number>firstOperand != <number>secondOperand;
			default:
				throw new Error(`Unknown operator: ${operation.Operator.Value}`);
		}
	}

	public static EvaluateOperand(operand: Operand): number | boolean {
		if (typeof operand.Value == "number" || typeof operand.Value == "boolean") {
			return operand.Value;
		}
		else if (operand.Value instanceof Parameter) {
			return operand.Value.Value;
		}
		else if (operand.Value instanceof UnaryOperation) {
			let evaluatedArguments: (number | boolean)[] = [];
			for (let index = 0; index < operand.Value.Func.ArgumentsCount; index++) {
				evaluatedArguments.push(MathParser.EvaluateOperand(operand.Value.Arguments.Arguments[index]));
			}
			let unaryResult = operand.Value.Func.Func(evaluatedArguments);
			return unaryResult;
		}
		else if (operand.Value instanceof BinaryOperation) {
			let binaryResult = MathParser.Evaluate(operand.Value);
			return binaryResult;
		}
		else {
			throw new Error("Unknown function");
		}
	}
}

class UnitTests {
	private static TestCases: { input: string, expectedValue: number | boolean }[] = [];
	private static readonly Delta = 0.01;

	public static DeclareTestCase(input: string, expectedValue: number | boolean): void {
		UnitTests.TestCases.push({ input: input, expectedValue: expectedValue });
	}
	public static Compare(compared: any, expected: any, delta: number = 0): boolean {
		if (typeof compared == "number" && typeof expected == "number") {
			return expected - delta <= compared && expected + delta >= compared;
		}
		else {
			return compared == expected;
		}
	}
	public static EvaluateHelper(expression: string): number | boolean {
		let evaluated = MathParser.EvaluateOperand(MathParser.Parse(expression));
		return evaluated;
	}
	public static RunTests(): void {
		UnitTests.TestCases.forEach((testCase, index) => {
			let evaluated = UnitTests.EvaluateHelper(testCase.input);
			let passed = UnitTests.Compare(evaluated, testCase.expectedValue, UnitTests.Delta);
			if (passed) {
				console.log(`%c Test ${index + 1} passed. Received: ${evaluated}, expected: ${testCase.expectedValue}`, 'background: #0a0; color: #fff');
			}
			else {
				console.log(`%c Test ${index + 1} failed. Received: ${evaluated}, expected: ${testCase.expectedValue}`, 'background: #a00; color: #fff');
			}
		})
	}
}

function Evaluate() {
	let input = document.getElementById('inp');
	let result = document.getElementById('res');
	if (input && result) {
		result.innerHTML = UnitTests.EvaluateHelper((<HTMLInputElement>input).value).toString();
	}
}

UnitTests.DeclareTestCase("cos(3550/20)*20+100", Math.cos(3550 / 20.0) * 20 + 100);
UnitTests.DeclareTestCase(
	"4^(2*5^(1/2)+4)*2^(-3-4*5^(1/2))+(6^(3^(1/2))*7^(3^(1/2)))/(42^(3^(1/2)-1))+(-12)/((sin(131/180*3,1415926535897932384626433832795))^2+(sin(221/180*3,1415926535897932384626433832795))^2)+44*sqrt(3)*tan(-480/180*3,1415926535897932384626433832795)*46*tan(7/180*3,1415926535897932384626433832795)*tan(83/180*3,1415926535897932384626433832795)",
	6134.0);
UnitTests.DeclareTestCase(
	"4^(2*5^(1/2)+4)*2^(-3-4*5^(1/2))+(6^(3^(1/2))*7^(3^(1/2)))/(42^(3^(1/2)-1))+(-12)/((sin(131/180*pi))^2+(sin(221/180*pi))^2)+44*sqrt(3)*tan(-480/180*pi)*46*tan(7/180*pi)*tan(83/180*pi)",
	6134.0);
UnitTests.DeclareTestCase("46*tan(7/180*3,1415926535897932384626433832795)*tan(83/180*3,1415926535897932384626433832795)", 46.0);
UnitTests.DeclareTestCase("(-12)/((sin(131/180*3,1415926535897932384626433832795))^2+(sin(221/180*3,1415926535897932384626433832795))^2)", -12.0);
UnitTests.DeclareTestCase("(6^(3^(1/2))*7^(3^(1/2)))/(42^(3^(1/2)-1))", 42.0);
UnitTests.DeclareTestCase("4 ^ (2 * 5 ^ (1 / 2) + 4) * 2 ^ (-3 - 4 * 5 ^ (1 / 2))", 32.0);
UnitTests.DeclareTestCase("cos(rad(sin(rad(deg(rad(30))))))", Math.cos(Math.sin(Math.PI / 6) / 180 * Math.PI));
UnitTests.DeclareTestCase("deg(acos(cos(asin(sin(rad(30))))))", 30.0);
UnitTests.DeclareTestCase("log(10^6;root(10^4;10+10))", 30.0);
UnitTests.DeclareTestCase("log(10^6;root(10+10;10^4))", 46117.3);
UnitTests.DeclareTestCase("2+2", 5.0);