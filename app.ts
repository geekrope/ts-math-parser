enum OperatorPrecedence
{
	First, Second, Third
}

type literal = number | boolean;

interface Func
{
	(value: (literal)[]): literal;
}

class Extensions
{
	public static split(value: string, ...separators: string[]): string[]
	{
		let split: string[] = [];
		let lastIndex = 0;
		for (let index = 0; index < value.length; index++)
		{
			for (let index2 = 0; index2 < separators.length; index2++)
			{
				if (index + separators[index2].length <= value.length)
				{
					let substr = value.substr(index, separators[index2].length);
					if (substr == separators[index2])
					{
						if (lastIndex != index)
						{
							split.push(value.substring(lastIndex, index));
						}
						lastIndex = index + 1;
					}
				}
			}
		}
		if (lastIndex < value.length)
		{
			split.push(value.substring(lastIndex));
		}
		return split;
	}
	public static replaceAll(searchValue: string, replaceValue: string, value: string): string
	{
		let index = value.indexOf(searchValue);
		while (index != -1)
		{
			value = Extensions.replace(value, index, index + searchValue.length, replaceValue);
			index = value.indexOf(searchValue);
		}
		return value;
	}
	public static replace(value: string, start: number, end: number, replaceValue: string): string
	{
		return value.substring(0, start) + replaceValue + value.substr(end);
	}
	public static asBoolean(value: literal): boolean
	{
		if (typeof value == "boolean")
		{
			return value;
		}
		else
		{
			throw new Error(`Unable to cast ${typeof value} to boolean`);
		}
	}
	public static asNumber(value: literal): number
	{
		if (typeof value == "number")
		{
			return value;
		}
		else
		{
			throw new Error(`Unable to cast ${typeof value} to number`);
		}
	}
}

class Operand
{
	public readonly Value: literal | Parameter | ArgumentArray | UnaryOperation | BinaryOperation;
	public constructor(value: literal | Parameter | ArgumentArray | UnaryOperation | BinaryOperation)
	{
		this.Value = value;
	}
}

class Parameter
{
	public readonly Name: string;
	public Value: literal;
	public constructor(name: string, value: literal)
	{
		this.Name = name;
		this.Value = value;
	}
}

class Operator
{
	public readonly Value: string;
	public readonly OperatorLevel: OperatorPrecedence;
	public constructor(value: string, operatorLevel: OperatorPrecedence)
	{
		this.Value = value;
		this.OperatorLevel = operatorLevel;
	}
}

class BinaryOperation
{
	public readonly FirstOperand: Operand;
	public readonly SecondOperand: Operand;
	public readonly Operator: Operator;
	public constructor(firstOperand: Operand, secondOperand: Operand, oper: Operator)
	{
		this.FirstOperand = firstOperand;
		this.SecondOperand = secondOperand;
		this.Operator = oper;
	}
}

class UnaryOperation
{
	public readonly Arguments: ArgumentArray;
	public readonly Func: MathFunction;
	public constructor(argument: ArgumentArray, func: MathFunction)
	{
		this.Arguments = argument;
		this.Func = func;
	}
}

class ArgumentArray
{
	public readonly Arguments: Operand[];
	public get Length(): number
	{
		return this.Arguments.length;
	}
	public constructor(argument: Operand[])
	{
		this.Arguments = argument;
	}
}

class MathFunction
{
	public readonly Type: string;
	public readonly ArgumentsCount: number;
	public readonly Func: Func;
	public constructor(type: string, argsCount: number, func: Func)
	{
		this.Type = type;
		this.ArgumentsCount = argsCount;
		this.Func = func;
	}
}

class MathParser
{
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

	public static readonly NegativeFunction: MathFunction = new MathFunction("negative", 1, (value: (literal)[]) => { return -Extensions.asNumber(value[0]); });

	public static readonly Functions: MathFunction[] = [
		new MathFunction("rad", 1, (value: (literal)[]) => { return Extensions.asNumber(value[0]) / 180.0 * Math.PI; }),
		new MathFunction("deg", 1, (value: (literal)[]) => { return Extensions.asNumber(value[0]) * 180.0 / Math.PI; }),

		new MathFunction("cos", 1, (value: (literal)[]) => { return Math.cos(Extensions.asNumber(value[0])); }),
		new MathFunction("sin", 1, (value: (literal)[]) => { return Math.sin(Extensions.asNumber(value[0])); }),
		new MathFunction("tan", 1, (value: (literal)[]) => { return Math.sin(Extensions.asNumber(value[0])) / Math.cos(Extensions.asNumber(value[0])); }),
		new MathFunction("cot", 1, (value: (literal)[]) => { return Math.cos(Extensions.asNumber(value[0])) / Math.sin(Extensions.asNumber(value[0])); }),

		new MathFunction("cosh", 1, (value: (literal)[]) => { return Math.cosh(Extensions.asNumber(value[0])); }),
		new MathFunction("sinh", 1, (value: (literal)[]) => { return Math.sinh(Extensions.asNumber(value[0])); }),
		new MathFunction("tanh", 1, (value: (literal)[]) => { return Math.sinh(Extensions.asNumber(value[0])) / Math.cosh(Extensions.asNumber(value[0])); }),
		new MathFunction("coth", 1, (value: (literal)[]) => { return Math.cosh(Extensions.asNumber(value[0])) / Math.sinh(Extensions.asNumber(value[0])); }),

		new MathFunction("acos", 1, (value: (literal)[]) => { return Math.acos(Extensions.asNumber(value[0])); }),
		new MathFunction("asin", 1, (value: (literal)[]) => { return Math.asin(Extensions.asNumber(value[0])); }),
		new MathFunction("atan", 1, (value: (literal)[]) => { return Math.atan(Extensions.asNumber(value[0])); }),
		new MathFunction("acot", 1, (value: (literal)[]) => { return Math.atan(1 / Extensions.asNumber(value[0])); }),

		new MathFunction("acosh", 1, (value: (literal)[]) => { return Math.acosh(Extensions.asNumber(value[0])); }),
		new MathFunction("asinh", 1, (value: (literal)[]) => { return Math.asinh(Extensions.asNumber(value[0])); }),
		new MathFunction("atanh", 1, (value: (literal)[]) => { return Math.atanh(Extensions.asNumber(value[0])) }),
		new MathFunction("acoth", 1, (value: (literal)[]) => { return Math.atanh(1 / Extensions.asNumber(value[0])) }),

		new MathFunction("sqrt", 1, (value: (literal)[]) => { return Math.sqrt(Extensions.asNumber(value[0])); }),
		new MathFunction("cbrt", 1, (value: (literal)[]) => { return Math.pow(Extensions.asNumber(value[0]), 1.0 / 3.0); }),

		new MathFunction("ln", 1, (value: (literal)[]) => { return Math.log(Extensions.asNumber(value[0])); }), //log(x)_e
		new MathFunction("abs", 1, (value: (literal)[]) => { return Math.abs(Extensions.asNumber(value[0])); }),

		new MathFunction("sign", 1, (value: (literal)[]) => { return Math.sign(Extensions.asNumber(value[0])); }),
		new MathFunction("exp", 1, (value: (literal)[]) => { return Math.exp(Extensions.asNumber(value[0])); }),
		new MathFunction("floor", 1, (value: (literal)[]) => { return Math.floor(Extensions.asNumber(value[0])); }),
		new MathFunction("ceil", 1, (value: (literal)[]) => { return Math.ceil(Extensions.asNumber(value[0])); }),
		new MathFunction("round", 1, (value: (literal)[]) => { return Math.round(Extensions.asNumber(value[0])); }),

		new MathFunction("!", 1, (value: (literal)[]) => { return !Extensions.asBoolean(value[0]); }),

		new MathFunction("fact", 1, (value: (literal)[]) => { let result = 1; for (let i = 1; i <= Extensions.asNumber(value[0]); i++) { result *= i } return result; }),
		new MathFunction("f'", 1, () => { throw new Error("Not implemented") }),

		new MathFunction("rand", 2, (value: (literal)[]) => { return Math.random() * (Extensions.asNumber(value[1]) - Extensions.asNumber(value[0])) + Extensions.asNumber(value[0]); }),

		new MathFunction("log", 2, (value: (literal)[]) => { return Math.log(Extensions.asNumber(value[0])) / Math.log(Extensions.asNumber(value[1])) }),
		new MathFunction("root", 2, (value: (literal)[]) => { return Math.pow(Extensions.asNumber(value[0]), 1 / Extensions.asNumber(value[1])) })
	];

	private static IsBasicOperator(value: string): boolean
	{
		let result = false;
		MathParser.Operators.forEach((oper) =>
		{
			if (!result)
			{
				result = oper.Value == value;
			}
		});
		return result;
	}

	private static CalculateOperators(expression: string, operands: Operand[]): { operands: Operand[], expression: string }
	{
		let split = Extensions.split(expression, MathParser.OperandKey);

		let calculate = (oper: string) =>
		{
			let sign = 1;
			for (let index = oper.length - 1; !MathParser.IsBasicOperator(oper); index--)
			{
				if (oper[index] == '-')
				{
					sign = -sign;
					oper = oper.substr(0, oper.length - 1);
				}
				else
				{
					throw new Error(`Incorrect operator: ${oper}`);
				}
			}
			return oper[0].toString() + (sign == -1 ? "-" : "");
		};

		for (let token = 0; token < split.length; token++)
		{
			if (!isNaN(Number(split[token])))
			{
				split[token] = `${MathParser.OperandKey}${parseInt(split[token])}${MathParser.OperandKey}`;
			}
			else
			{
				let oper = calculate(split[token]);
				let operandIndex = parseInt(split[token + 1]);

				if (token == 0)
				{
					split[token] = "";

					if (oper == "-")
					{
						operands[operandIndex] = new Operand(new UnaryOperation(new ArgumentArray([operands[operandIndex]]), MathParser.NegativeFunction));
					}

					// -- = + => split[token]=""

					else if (oper != "--")
					{
						throw new Error(`Can't parse operator: ${split[token]}`);
					}
				}
				else
				{
					if (!MathParser.IsBasicOperator(split[token]))
					{
						split[token] = oper[0].toString();

						if (oper.length > 1 && oper[1] == '-')
						{
							operands[operandIndex] = new Operand(new UnaryOperation(new ArgumentArray([operands[operandIndex]]), MathParser.NegativeFunction));
						}
					}
				}
			}
		}

		return { operands: operands, expression: split.join("") };
	}

	private static GetOperands(expression: string, parameters?: Parameter[], addedOperands?: Operand[]): { operands: Operand[], expression: string }
	{
		let operands: Operand[] = [];

		if (addedOperands != null)
		{
			operands = operands.concat(addedOperands);
		}

		let lastIndex = 0;

		let operators: string[] = [];
		MathParser.Operators.forEach((oper) =>
		{
			operators.push(oper.Value);
		});

		let addOperand = (start: number, end: number) =>
		{
			let operand = expression.substring(start, end);
			if (operand.length > 0)
			{
				if (operand[0].toString() == MathParser.OperandKey && operand[operand.length - 1].toString() == MathParser.OperandKey)
				{
					return start + operand.length;
				}
				else
				{
					let replaceValue = `${MathParser.OperandKey}${operands.length}${MathParser.OperandKey}`;
					expression = Extensions.replace(expression, lastIndex, end, replaceValue);
					operands.push(MathParser.ParseOperand(operand, parameters, operands));
					return start + replaceValue.length;
				}
			}
			else
			{
				return -1;
			}
		};

		for (let index = 0; index < expression.length; index++)
		{
			let currentOperator = "";

			operators.forEach((oper) =>
			{
				if (index + oper.length <= expression.length && oper.length > currentOperator.length)
				{
					let subExpression = expression.substr(index, oper.length);
					if (subExpression == oper)
					{
						currentOperator = oper;
					}
				}
			});


			if (currentOperator != "")
			{
				let currentIndex = addOperand(lastIndex, index);
				index = currentIndex == -1 ? index : currentIndex;
				lastIndex = index + currentOperator.length;
			}
		}

		addOperand(lastIndex, expression.length);

		return { operands: operands, expression: expression };
	}

	private static GroupBinaryOperations(expression: string, operands: Operand[], level: OperatorPrecedence): { operands: Operand[], expression: string }
	{
		let split = Extensions.split(expression, MathParser.OperandKey);

		let operators: Operator[] = [];
		MathParser.Operators.forEach((oper) =>
		{
			if (level == oper.OperatorLevel)
			{
				operators.push(oper);
			}
		});

		for (let token = 1; token < split.length - 1;)
		{
			let currentOperator: Operator | undefined;

			operators.forEach((oper) =>
			{
				if (oper.Value == split[token])
				{
					currentOperator = oper;
				}
			});

			if (currentOperator !== undefined)
			{
				let firstOperandIndex = parseInt(split[token - 1]);
				let secondOperandIndex = parseInt(split[token + 1]);
				let expressionToReplace = `${MathParser.OperandKey}${firstOperandIndex}${MathParser.OperandKey}${currentOperator.Value}${MathParser.OperandKey}${secondOperandIndex}${MathParser.OperandKey}`;

				operands.push(new Operand(new BinaryOperation(operands[firstOperandIndex], operands[secondOperandIndex], currentOperator)));

				expression = Extensions.replaceAll(expressionToReplace, `${MathParser.OperandKey}${operands.length - 1}${MathParser.OperandKey}`, expression);

				token = 1;
				split = Extensions.split(expression, MathParser.OperandKey);
			}
			else
			{
				token++;
			}
		}

		return { operands: operands, expression: expression };
	}

	private static SplitExpression(expression: string, parameters?: Parameter[], operands?: Operand[]): Operand
	{
		let calculatedOperands = MathParser.GetOperands(expression, parameters, operands);

		let calculatedOperators = MathParser.CalculateOperators(calculatedOperands.expression, calculatedOperands.operands);

		let thirdLevel = MathParser.GroupBinaryOperations(calculatedOperators.expression, calculatedOperators.operands, OperatorPrecedence.Third);
		let secondLevel = MathParser.GroupBinaryOperations(thirdLevel.expression, thirdLevel.operands, OperatorPrecedence.Second);
		let firstLevel = MathParser.GroupBinaryOperations(secondLevel.expression, secondLevel.operands, OperatorPrecedence.First);

		return firstLevel.operands[MathParser.ParseOperandIndex(firstLevel.expression)];
	}

	private static ParseOperand(operand: string, parameters?: Parameter[], addedOperands?: Operand[]): Operand
	{
		let allParameters = MathParser.GetParameters(parameters);

		if (!isNaN(Number(operand)))
		{
			return new Operand(parseFloat(operand));
		}
		else if (operand[0].toString() == MathParser.OperandKey && operand[operand.length - 1].toString() == MathParser.OperandKey)
		{
			if (!addedOperands)
			{
				throw new Error("addedOperands is not defined");
			}
			return addedOperands[MathParser.ParseOperandIndex(operand)];
		}
		else if (allParameters.has(operand))
		{
			return new Operand(allParameters.get(operand)!);
		}
		else if (operand.indexOf(MathParser.Enumerator) != -1)
		{
			let args = Extensions.split(operand, MathParser.Enumerator);
			let operands: Operand[] = [];

			for (let index = 0; index < args.length; index++)
			{
				operands.push(MathParser.SplitExpression(args[index], parameters, addedOperands));
			}

			return new Operand(new ArgumentArray(operands));
		}
		else
		{
			let returnValue: Operand | undefined;

			let suitableFunctions: MathFunction[] = [];

			MathParser.Functions.forEach((func) =>
			{
				if (func.Type.length < operand.length && operand.substr(0, func.Type.length) == func.Type)
				{
					suitableFunctions.push(func);
				}
			});

			if (suitableFunctions.length == 0)
			{
				if (!operand.includes(MathParser.OperandKey)) // if expression doesn't contain operand key we consider it as parameter
				{
					return new Operand(new Parameter(operand, 0));
				}
				else
				{
					throw new Error("Function wasn't found");
				}
			}

			let mostSuitableFunction: MathFunction = suitableFunctions[0];

			suitableFunctions.forEach((func) =>
			{
				if (mostSuitableFunction)
				{
					if (func.Type.length > mostSuitableFunction.Type.length)
					{
						mostSuitableFunction = func;
					}
				}
			});

			let innerExpression = operand.substr(mostSuitableFunction.Type.length, operand.length - mostSuitableFunction.Type.length);

			let value = MathParser.ParseOperand(innerExpression, parameters, addedOperands);

			if (value.Value instanceof ArgumentArray)
			{
				if (value.Value.Length != mostSuitableFunction.ArgumentsCount)
				{
					throw new Error(`Function doesn't take ${value.Value.Length} arguments`);
				}
				else
				{
					returnValue = new Operand(new UnaryOperation(value.Value, mostSuitableFunction));
				}
			}
			else if (1 != mostSuitableFunction.ArgumentsCount)
			{
				throw new Error("Function doesn't take 1 argument");
			}
			else
			{
				returnValue = new Operand(new UnaryOperation(new ArgumentArray([value]), mostSuitableFunction));
			}

			return returnValue;
		}
	}

	private static GetParameters(parameters?: Parameter[]): Map<string, Parameter>
	{
		let output: Map<string, Parameter> = new Map<string, Parameter>();

		MathParser.Constants.forEach((constant) =>
		{
			output.set(constant.Name, constant);
		});

		if (parameters != null)
		{
			parameters.forEach((parameter) =>
			{
				if (!output.has(parameter.Name))
				{
					output.set(parameter.Name, parameter);
				}
				else
				{
					throw new Error(`Double parameter ${parameter.Name} declaration`);
				}
			});
		}

		return output;
	}

	private static ParseOperandIndex(operand: string): number
	{
		return parseInt(Extensions.replaceAll(MathParser.OperandKey, "", operand));
	}

	private static OpenBraces(expression: string, parameters?: Parameter[]): { operands: Operand[], expression: string }
	{
		let operands: Operand[] = [];

		for (; expression.indexOf("(") != -1;)
		{
			let expressionLast = expression;
			let maxBracesCount = 0;
			let bracesCount = 0;
			let currentOpenIndex = 0;
			let openIndex = -1;
			let closeIndex = -1;

			for (let index = 0; index < expression.length; index++)
			{
				if (expression[index] == '(')
				{
					bracesCount++;
					currentOpenIndex = index;
				}
				if (expression[index] == ')')
				{
					if (bracesCount > maxBracesCount)
					{
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

			if (expressionLast == expression)
			{
				throw new Error(`Can't open braces in: ${expression}`);
			}
		}

		return { operands: operands, expression: expression };
	}

	public static Parse(expression: string, parameters?: Parameter[]): Operand
	{
		expression = expression.replace(/\s/gi, "").replace(/\,/gi, ".");

		let openedBraces = MathParser.OpenBraces(expression, parameters);

		return MathParser.SplitExpression(openedBraces.expression, parameters, openedBraces.operands);
	}

	public static Evaluate(operation: BinaryOperation): literal
	{
		let firstOperand = MathParser.EvaluateOperand(operation.FirstOperand);
		let secondOperand = MathParser.EvaluateOperand(operation.SecondOperand);

		switch (operation.Operator.Value)
		{
			case "-":
				return Extensions.asNumber(firstOperand) - Extensions.asNumber(secondOperand);
			case "+":
				return Extensions.asNumber(firstOperand) + Extensions.asNumber(secondOperand);
			case "*":
				return Extensions.asNumber(firstOperand) * Extensions.asNumber(secondOperand);
			case "/":
				return Extensions.asNumber(firstOperand) / Extensions.asNumber(secondOperand);
			case "%":
				return Extensions.asNumber(firstOperand) % Extensions.asNumber(secondOperand);
			case "^":
				return Math.pow(Extensions.asNumber(firstOperand), Extensions.asNumber(secondOperand));
			case "&":
				return Extensions.asBoolean(firstOperand) && Extensions.asBoolean(secondOperand);
			case "|":
				return Extensions.asBoolean(firstOperand) || Extensions.asBoolean(secondOperand);
			case ">":
				return Extensions.asNumber(firstOperand) > Extensions.asNumber(secondOperand);
			case "<":
				return Extensions.asNumber(firstOperand) < Extensions.asNumber(secondOperand);
			case "ge":
			case ">=":
				return Extensions.asNumber(firstOperand) >= Extensions.asNumber(secondOperand);
			case "le":
			case "<=":
				return Extensions.asNumber(firstOperand) <= Extensions.asNumber(secondOperand);
			case "==":
				return Extensions.asNumber(firstOperand) == Extensions.asNumber(secondOperand);
			case "!=":
				return Extensions.asNumber(firstOperand) != Extensions.asNumber(secondOperand);
			default:
				throw new Error(`Unknown operator: ${operation.Operator.Value}`);
		}
	}

	public static EvaluateOperand(operand: Operand): literal
	{
		if (typeof operand.Value == "number" || typeof operand.Value == "boolean")
		{
			return operand.Value;
		}
		else if (operand.Value instanceof Parameter)
		{
			return operand.Value.Value;
		}
		else if (operand.Value instanceof UnaryOperation)
		{
			let evaluatedArguments: (literal)[] = [];
			for (let index = 0; index < operand.Value.Func.ArgumentsCount; index++)
			{
				evaluatedArguments.push(MathParser.EvaluateOperand(operand.Value.Arguments.Arguments[index]));
			}
			let unaryResult = operand.Value.Func.Func(evaluatedArguments);
			return unaryResult;
		}
		else if (operand.Value instanceof BinaryOperation)
		{
			let binaryResult = MathParser.Evaluate(operand.Value);
			return binaryResult;
		}
		else
		{
			throw new Error("Unknown function");
		}
	}

	private static ArgumentsToLatex(args: ArgumentArray): string
	{
		var innerFunction = "";
		for (let index = 0; index < args.Length; index++)
		{
			innerFunction += MathParser.OperandToLatexFormula(args.Arguments[index]);
			if (index < args.Length - 1)
			{
				innerFunction += MathParser.Enumerator;
			}
		}
		return innerFunction;
	}

	public static OperandToLatexFormula(operand: Operand): string
	{
		let output = "";

		if (typeof operand.Value == "number" || typeof operand.Value == "boolean")
		{
			output += operand.Value.toString();
		}
		else if (operand.Value instanceof Parameter)
		{
			switch (operand.Value.Name)
			{
				case "pi":
					output += "\pi";
					break;
				case "infinity":
					output += "\infty";
					break;
				default:
					output += operand.Value.Name;
					break;
			}
		}
		else if (operand.Value instanceof UnaryOperation)
		{
			var innerFunction = MathParser.ArgumentsToLatex(operand.Value.Arguments);

			switch (operand.Value.Func.Type)
			{
				case "negative":
					let argumentValue = operand.Value.Arguments.Arguments[0].Value;
					if (typeof argumentValue == "number" || typeof operand.Value == "boolean" || argumentValue instanceof Parameter || argumentValue instanceof UnaryOperation)
					{
						output += "-" + innerFunction + "";
					}
					else
					{
						output += "-(" + innerFunction + ")";
					}
					break;
				case "sqrt":
					output += "\\sqrt{" + innerFunction + "}";
					break;
				case "cbrt":
					output += "\\sqrt[3]{" + innerFunction + "}";
					break;
				case "rad":
					output += innerFunction;
					break;
				case "deg":
					output += "{" + innerFunction + "}" + "^{\\circ}";
					break;
				case "ln":
					output += "\\log_e{(" + innerFunction + ")}";
					break;
				case "log":
					output += "\\log_{" + MathParser.OperandToLatexFormula(operand.Value.Arguments.Arguments[1]) + "}{(" + MathParser.OperandToLatexFormula(operand.Value.Arguments.Arguments[0]) + ")}";
					break;
				case "rand":
					output += "rand(" + innerFunction + ")";
					break;
				case "root":
					output += "\\sqrt[" + MathParser.OperandToLatexFormula(operand.Value.Arguments.Arguments[1]) + "]{" + MathParser.OperandToLatexFormula(operand.Value.Arguments.Arguments[0]) + "}";
					break;
				case "!":
					output += "not \\;(" + innerFunction + ")";
					break;
				case "acos":
					output += "\\arccos{(" + innerFunction + ")}";
					break;
				case "asin":
					output += "\\arcsin{(" + innerFunction + ")}";
					break;
				case "atan":
					output += "\\arctan{(" + innerFunction + ")}";
					break;
				case "acot":
					output += "\\arctan{(\\frac{1}{" + innerFunction + "})}";
					break;
				case "acosh":
					output += "\\cosh^{-1}{(" + innerFunction + ")}";
					break;
				case "asinh":
					output += "\\sinh^{-1}1{(" + innerFunction + ")}";
					break;
				case "atanh":
					output += "\\tanh^{-1}{(" + innerFunction + ")}";
					break;
				case "acoth":
					output += "\\tanh^{-1}{(\\frac{1}{" + innerFunction + "})}";
					break;
				case "exp":
					output += "e^{" + innerFunction + "}";
					break;
				case "floor":
					output += "⌊" + innerFunction + "⌋";
					break;
				case "round":
					output += "round(" + innerFunction + ")";
					break;
				case "ceil":
					output += "⌈" + innerFunction + "⌉";
					break;
				case "abs":
					output += "|" + innerFunction + "|";
					break;
				case "f'":
					output += "\\frac{d}{dx}(" + innerFunction + ")";
					break;
				case "fact":
					output += innerFunction + "!";
					break;
				case "sign":
					output += "sgn(" + innerFunction + ")";
					break;
				default:
					output += "\\" + operand.Value.Func.Type + "{" + innerFunction + "}";
					break;
			}

		}
		else if (operand.Value instanceof BinaryOperation)
		{
			output += MathParser.BinaryOperationToLatexFormula(operand.Value);
		}
		else
		{
			return ""; //error
		}

		return output;
	}

	public static BinaryOperationToLatexFormula(operation: BinaryOperation): string
	{
		let output = "";

		let firstOperand = MathParser.OperandToLatexFormula(operation.FirstOperand);
		let secondOperand = MathParser.OperandToLatexFormula(operation.SecondOperand);

		if (operation.FirstOperand.Value instanceof BinaryOperation)
		{
			var firstOperation = operation.FirstOperand.Value;
			if ((firstOperation.Operator.OperatorLevel < operation.Operator.OperatorLevel || operation.Operator.Value == "-") && operation.Operator.Value != "/")
			{
				firstOperand = "(" + firstOperand + ")";
			}
		}

		if (operation.SecondOperand.Value instanceof BinaryOperation)
		{
			var secondOperation = operation.SecondOperand.Value;
			if ((secondOperation.Operator.OperatorLevel < operation.Operator.OperatorLevel || operation.Operator.Value == "-") && operation.Operator.Value != "^" && operation.Operator.Value != "/")
			{
				secondOperand = "(" + secondOperand + ")";
			}
		}

		switch (operation.Operator.Value)
		{
			case "*":
				output += `${firstOperand} \\cdot ${secondOperand}`;
				break;
			case "/":
				output += "\\frac{" + firstOperand + "}{" + secondOperand + "}";
				break;
			case ">=":
				output += firstOperand + "\\geq" + secondOperand;
				break;
			case "<=":
				output += firstOperand + "\\leq" + secondOperand;
				break;
			case "==":
				output += firstOperand + "\\equiv" + secondOperand;
				break;
			case "!=":
				output += firstOperand + "\\neq" + secondOperand;
				break;
			case "&":
				output += firstOperand + "\\; and \\;" + secondOperand;
				break;
			case "|":
				output += firstOperand + "\\; or \\;" + secondOperand;
				break;
			case "^":
				let powerAfrer = () =>
				{
					output += "{" + firstOperand + "}^{" + secondOperand + "}";
				};

				let powerBefore = () =>
				{
					var funct = <UnaryOperation>operation.FirstOperand.Value;
					output += `\\${funct.Func.Type}^${MathParser.OperandToLatexFormula(operation.SecondOperand)}` + "{(" + MathParser.ArgumentsToLatex(funct.Arguments) + ")}";
				};

				if (operation.FirstOperand.Value instanceof UnaryOperation)
				{
					var func = (operation.FirstOperand.Value).Func;
					switch (func.Type)
					{
						case "cos":
							powerBefore();
							break;
						case "sin":
							powerBefore();
							break;
						case "tan":
							powerBefore();
							break;
						case "cot":
							powerBefore();
							break;
						case "acos":
							powerBefore();
							break;
						case "asin":
							powerBefore();
							break;
						case "atan":
							powerBefore();
							break;
						case "acot":
							powerBefore();
							break;
						default:
							powerAfrer();
							break;
					}
				}
				else
				{
					powerAfrer();
				}

				break;
			default:
				output += `${firstOperand} ${operation.Operator.Value} ${secondOperand}`;
				break;
		}

		return output;
	}
}

interface TestCase
{
	(): void;
}

class UnitTests
{
	private static TestCases: TestCase[] = [];
	private static readonly Delta = 0.01;

	private static DisplayResult(received: string, expected: string, passed: boolean, type: string)
	{
		if (passed)
		{
			console.log(`%c Test ${type} passed. Received: ${received}, expected: ${expected} `, 'background: #0a0; color: #fff');
		}
		else
		{
			console.log(`%c Test ${type} failed. Received: ${received}, expected: ${expected} `, 'background: #a00; color: #fff');
		}
	}

	public static DeclareTestCase(testCase: TestCase): void
	{
		UnitTests.TestCases.push(testCase);
	}

	public static AreEqual(expression: string, expected: literal): void
	{
		let compared = UnitTests.EvaluateHelper(expression);
		let passed: boolean;
		if (typeof compared == "number" && typeof expected == "number")
		{
			passed = expected - UnitTests.Delta <= compared && expected + UnitTests.Delta >= compared;
		}
		else
		{
			passed = compared == expected;
		}
		UnitTests.DisplayResult(compared.toString(), expected.toString(), passed, `"${expression}"`);
	}
	public static AreUnequal(expression: string, expected: literal): void
	{
		let compared = UnitTests.EvaluateHelper(expression);
		let passed: boolean;
		if (typeof compared == "number" && typeof expected == "number")
		{
			passed = !(expected - UnitTests.Delta <= compared && expected + UnitTests.Delta >= compared);
		}
		else
		{
			passed = compared != expected;
		}
		UnitTests.DisplayResult(compared.toString(), expected.toString(), passed, `"${expression}"`);
	}
	public static ThrowError(expression: string): void
	{
		try
		{
			let result = UnitTests.EvaluateHelper(expression);
			UnitTests.DisplayResult(result.toString(), "Error", false, `"${expression}"`);
		}
		catch {
			UnitTests.DisplayResult("Error", "Error", true, `"${expression}"`);
		}
	}
	public static IsTrue(expression: boolean): void
	{
		UnitTests.DisplayResult(expression ? "true" : "false", "true", expression, `"is true"`);
	}

	public static EvaluateHelper(expression: string): literal
	{
		let evaluated = MathParser.EvaluateOperand(MathParser.Parse(expression));
		return evaluated;
	}
	public static RunTests(): void
	{
		UnitTests.TestCases.forEach((testCase) =>
		{
			testCase();
		})
	}
}

function Evaluate()
{
	let input = document.getElementById('inp');
	let result = document.getElementById('res');
	let expression = document.getElementById('expression');
	if (input && result && expression)
	{
		result.innerHTML = UnitTests.EvaluateHelper((<HTMLInputElement>input).value).toString();
		expression.innerHTML = "$" + MathParser.OperandToLatexFormula(MathParser.Parse((<HTMLInputElement>input).value)) + "$";
	}
}

UnitTests.DeclareTestCase(() =>
{
	UnitTests.AreEqual("cos(3550/20)*20+100", Math.cos(3550 / 20.0) * 20 + 100);
});
UnitTests.DeclareTestCase(() =>
{
	UnitTests.AreEqual(
		"4^(2*5^(1/2)+4)*2^(-3-4*5^(1/2))+(6^(3^(1/2))*7^(3^(1/2)))/(42^(3^(1/2)-1))+(-12)/((sin(131/180*3,1415926535897932384626433832795))^2+(sin(221/180*3,1415926535897932384626433832795))^2)+44*sqrt(3)*tan(-480/180*3,1415926535897932384626433832795)*46*tan(7/180*3,1415926535897932384626433832795)*tan(83/180*3,1415926535897932384626433832795)",
		6134.0);
});
UnitTests.DeclareTestCase(() =>
{
	UnitTests.AreEqual(
		"4^(2*5^(1/2)+4)*2^(-3-4*5^(1/2))+(6^(3^(1/2))*7^(3^(1/2)))/(42^(3^(1/2)-1))+(-12)/((sin(131/180*pi))^2+(sin(221/180*pi))^2)+44*sqrt(3)*tan(-480/180*pi)*46*tan(7/180*pi)*tan(83/180*pi)",
		6134.0);
});
UnitTests.DeclareTestCase(() =>
{
	UnitTests.AreEqual("46*tan(7/180*3,1415926535897932384626433832795)*tan(83/180*3,1415926535897932384626433832795)", 46.0);
});
UnitTests.DeclareTestCase(() =>
{
	UnitTests.AreEqual("(-12)/((sin(131/180*3,1415926535897932384626433832795))^2+(sin(221/180*3,1415926535897932384626433832795))^2)", -12.0);
});
UnitTests.DeclareTestCase(() =>
{
	UnitTests.AreEqual("(6^(3^(1/2))*7^(3^(1/2)))/(42^(3^(1/2)-1))", 42.0);
});
UnitTests.DeclareTestCase(() =>
{
	UnitTests.AreEqual("4 ^ (2 * 5 ^ (1 / 2) + 4) * 2 ^ (-3 - 4 * 5 ^ (1 / 2))", 32.0);
});
UnitTests.DeclareTestCase(() =>
{
	UnitTests.AreEqual("cos(rad(sin(rad(deg(rad(30))))))", Math.cos(Math.sin(Math.PI / 6) / 180 * Math.PI));
});
UnitTests.DeclareTestCase(() =>
{
	UnitTests.AreEqual("deg(acos(cos(asin(sin(rad(30))))))", 30.0);
});
UnitTests.DeclareTestCase(() =>
{
	UnitTests.AreEqual("log(10^6;root(10^4;10+10))", 30.0);
});
UnitTests.DeclareTestCase(() =>
{
	UnitTests.AreEqual("log(10^6;root(10+10;10^4))", 46117.3);
});
UnitTests.DeclareTestCase(() =>
{
	UnitTests.AreUnequal("2+2", 5);
});
UnitTests.DeclareTestCase(() =>
{
	const expression = "sdgphjsdioghiosdnhiosd";
	const operand = MathParser.Parse(expression);
	UnitTests.IsTrue((operand.Value) instanceof Parameter);
	UnitTests.IsTrue((<Parameter>(operand.Value)).Name == expression);
});
UnitTests.DeclareTestCase(() =>
{
	UnitTests.ThrowError("sdgphjsdioghiosdnhiosd(0)");
});
UnitTests.DeclareTestCase(() =>
{
	UnitTests.AreEqual("3+-4", -1);
});
UnitTests.DeclareTestCase(() =>
{
	UnitTests.AreEqual("-2+3", 1);
});
UnitTests.DeclareTestCase(() =>
{
	UnitTests.ThrowError("1&3");
});
UnitTests.DeclareTestCase(() =>
{
	UnitTests.ThrowError("!(1)");
});
UnitTests.DeclareTestCase(() =>
{
	UnitTests.AreEqual("cossinlnraddeg(pi/2)", 0.9);
});
UnitTests.DeclareTestCase(() =>
{
	UnitTests.AreEqual("sincos(-2)", -0.4);
});
UnitTests.DeclareTestCase(() =>
{
	UnitTests.AreEqual("root(root(2;cossinlnraddeg(pi/2));log(pi;e))", 1.95);
});
UnitTests.DeclareTestCase(() =>
{
	UnitTests.AreEqual("sinh(10)", Math.sinh(10));
});
UnitTests.DeclareTestCase(() =>
{
	UnitTests.AreEqual("(e^10-e^(-10))/2", Math.sinh(10));
});
UnitTests.DeclareTestCase(() =>
{
	UnitTests.ThrowError("sinhh(10)");
});

//UnitTests.RunTests()