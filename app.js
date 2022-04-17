"use strict";
var OperatorPrecedence;
(function (OperatorPrecedence) {
    OperatorPrecedence[OperatorPrecedence["First"] = 0] = "First";
    OperatorPrecedence[OperatorPrecedence["Second"] = 1] = "Second";
    OperatorPrecedence[OperatorPrecedence["Third"] = 2] = "Third";
})(OperatorPrecedence || (OperatorPrecedence = {}));
class Extensions {
    static split(value, ...separators) {
        let split = [];
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
    static replaceAll(searchValue, replaceValue, value) {
        let index = value.indexOf(searchValue);
        while (index != -1) {
            value = Extensions.replace(value, index, index + searchValue.length, replaceValue);
            index = value.indexOf(searchValue);
        }
        return value;
    }
    static replace(value, start, end, replaceValue) {
        return value.substring(0, start) + replaceValue + value.substr(end);
    }
    static asBoolean(value) {
        if (typeof value == "boolean") {
            return value;
        }
        else {
            throw new Error(`Unable to cast ${typeof value} to boolean`);
        }
    }
    static asNumber(value) {
        if (typeof value == "number") {
            return value;
        }
        else {
            throw new Error(`Unable to cast ${typeof value} to number`);
        }
    }
}
class Operand {
    constructor(value) {
        this.Value = value;
    }
}
class Parameter {
    constructor(name, value) {
        this.Name = name;
        this.Value = value;
    }
}
class Operator {
    constructor(value, operatorLevel) {
        this.Value = value;
        this.OperatorLevel = operatorLevel;
    }
}
class BinaryOperation {
    constructor(firstOperand, secondOperand, oper) {
        this.FirstOperand = firstOperand;
        this.SecondOperand = secondOperand;
        this.Operator = oper;
    }
}
class UnaryOperation {
    constructor(argument, func) {
        this.Arguments = argument;
        this.Func = func;
    }
}
class ArgumentArray {
    constructor(argument) {
        this.Arguments = argument;
    }
    get Length() {
        return this.Arguments.length;
    }
}
class MathFunction {
    constructor(type, argsCount, func) {
        this.Type = type;
        this.ArgumentsCount = argsCount;
        this.Func = func;
    }
}
class Preprocessor {
    constructor(type, argsCount, func) {
        this.Type = type;
        this.ArgumentsCount = argsCount;
        this.Func = func;
    }
}
class LatexExpressionVisitor {
    Braces(operation, firstOperand, secondOperand) {
        if (operation.FirstOperand.Value instanceof BinaryOperation) {
            var firstOperation = operation.FirstOperand.Value;
            if (firstOperation.Operator.OperatorLevel < operation.Operator.OperatorLevel && operation.Operator.Value != "/") {
                firstOperand = "(" + firstOperand + ")";
            }
        }
        if (operation.SecondOperand.Value instanceof BinaryOperation) {
            var secondOperation = operation.SecondOperand.Value;
            if (secondOperation.Operator.OperatorLevel < operation.Operator.OperatorLevel && operation.Operator.Value != "^" && operation.Operator.Value != "/") {
                secondOperand = "(" + secondOperand + ")";
            }
        }
        return { firstOperand: firstOperand, secondOperand: secondOperand };
    }
    LiteralToString(operand) {
        return operand.toString();
    }
    ParameterToString(operand) {
        switch (operand.Name) {
            case "pi":
                return "\pi";
            case "infinity":
                return "\infty";
            default:
                return operand.Name;
        }
    }
    ArgumentsToString(args) {
        var innerFunction = "";
        for (let index = 0; index < args.Length; index++) {
            innerFunction += MathParser.OperandToText(args.Arguments[index], this);
            if (index < args.Length - 1) {
                innerFunction += MathParser.Enumerator;
            }
        }
        return innerFunction;
    }
    UnaryOperationToString(operand) {
        var innerFunction = this.ArgumentsToString(operand.Arguments);
        switch (operand.Func.Type) {
            case "negative":
                let argumentValue = operand.Arguments.Arguments[0].Value;
                if (!(argumentValue instanceof BinaryOperation) || (argumentValue instanceof BinaryOperation && argumentValue.Operator.Value == "^")) {
                    return "-" + innerFunction + "";
                }
                else {
                    return "-(" + innerFunction + ")";
                }
            case "sqrt":
                return "\\sqrt{" + innerFunction + "}";
            case "cbrt":
                return "\\sqrt[3]{" + innerFunction + "}";
            case "rad":
                return innerFunction;
            case "deg":
                return "{" + innerFunction + "}" + "^{\\circ}";
            case "ln":
                return "\\log_e{(" + innerFunction + ")}";
            case "log":
                return "\\log_{" + MathParser.OperandToText(operand.Arguments.Arguments[1], this) + "}{(" + MathParser.OperandToText(operand.Arguments.Arguments[0], this) + ")}";
            case "rand":
                return "rand(" + innerFunction + ")";
            case "root":
                return "\\sqrt[" + MathParser.OperandToText(operand.Arguments.Arguments[1], this) + "]{" + MathParser.OperandToText(operand.Arguments.Arguments[0], this) + "}";
            case "!":
                return "not \\;(" + innerFunction + ")";
            case "acos":
                return "\\arccos{(" + innerFunction + ")}";
            case "asin":
                return "\\arcsin{(" + innerFunction + ")}";
            case "atan":
                return "\\arctan{(" + innerFunction + ")}";
            case "acot":
                return "\\arctan{(\\frac{1}{" + innerFunction + "})}";
            case "acosh":
                return "\\cosh^{-1}{(" + innerFunction + ")}";
            case "asinh":
                return "\\sinh^{-1}1{(" + innerFunction + ")}";
            case "atanh":
                return "\\tanh^{-1}{(" + innerFunction + ")}";
            case "acoth":
                return "\\tanh^{-1}{(\\frac{1}{" + innerFunction + "})}";
            case "exp":
                return "e^{" + innerFunction + "}";
            case "floor":
                return "⌊" + innerFunction + "⌋";
            case "round":
                return "round(" + innerFunction + ")";
            case "ceil":
                return "⌈" + innerFunction + "⌉";
            case "abs":
                return "|" + innerFunction + "|";
            case "f'":
                return "\\frac{d}{dx}(" + innerFunction + ")";
            case "fact":
                return innerFunction + "!";
            case "sign":
                return "sgn(" + innerFunction + ")";
            default:
                return "\\" + operand.Func.Type + "{" + innerFunction + "}";
        }
    }
    BinaryOperationToString(operation, firstOperand, secondOperand) {
        let fixedOperands = this.Braces(operation, firstOperand, secondOperand);
        firstOperand = fixedOperands.firstOperand;
        secondOperand = fixedOperands.secondOperand;
        switch (operation.Operator.Value) {
            case "*":
                return `${firstOperand} \\cdot ${secondOperand}`;
            case "/":
                return "\\frac{" + firstOperand + "}{" + secondOperand + "}";
            case ">=":
                return firstOperand + "\\geq" + secondOperand;
            case "<=":
                return firstOperand + "\\leq" + secondOperand;
            case "==":
                return firstOperand + "\\equiv" + secondOperand;
            case "!=":
                return firstOperand + "\\neq" + secondOperand;
            case "&":
                return firstOperand + "\\; and \\;" + secondOperand;
            case "|":
                return firstOperand + "\\; or \\;" + secondOperand;
            case "^":
                let powerAfrer = () => {
                    return "{" + firstOperand + "}^{" + secondOperand + "}";
                };
                let powerBefore = () => {
                    var funct = operation.FirstOperand.Value;
                    return `\\${funct.Func.Type}^${MathParser.OperandToText(operation.SecondOperand, this)}` + "{(" + this.ArgumentsToString(funct.Arguments) + ")}";
                };
                if (operation.FirstOperand.Value instanceof UnaryOperation) {
                    var func = (operation.FirstOperand.Value).Func;
                    switch (func.Type) {
                        case "cos":
                            return powerBefore();
                        case "sin":
                            return powerBefore();
                        case "tan":
                            return powerBefore();
                        case "cot":
                            return powerBefore();
                        case "cosh":
                            return powerBefore();
                        case "sinh":
                            return powerBefore();
                        case "tanh":
                            return powerBefore();
                        case "coth":
                            return powerBefore();
                        case "acos":
                            return powerBefore();
                        case "asin":
                            return powerBefore();
                        case "atan":
                            return powerBefore();
                        case "acot":
                            return powerBefore();
                        default:
                            return powerAfrer();
                    }
                }
                else {
                    return powerAfrer();
                }
            default:
                return `${firstOperand} ${operation.Operator.Value} ${secondOperand}`;
        }
    }
}
class PlainTextExpressionVisitor {
    Braces(operation, firstOperand, secondOperand) {
        if (operation.FirstOperand.Value instanceof BinaryOperation) {
            var firstOperation = operation.FirstOperand.Value;
            if (firstOperation.Operator.OperatorLevel < operation.Operator.OperatorLevel || operation.Operator.Value == "/") {
                firstOperand = "(" + firstOperand + ")";
            }
        }
        if (operation.SecondOperand.Value instanceof BinaryOperation) {
            var secondOperation = operation.SecondOperand.Value;
            if (secondOperation.Operator.OperatorLevel < operation.Operator.OperatorLevel || operation.Operator.Value == "/") {
                secondOperand = "(" + secondOperand + ")";
            }
        }
        return { firstOperand: firstOperand, secondOperand: secondOperand };
    }
    LiteralToString(operand) {
        return operand.toString();
    }
    ParameterToString(operand) {
        return operand.Name;
    }
    ArgumentsToString(args) {
        var innerFunction = "";
        for (let index = 0; index < args.Length; index++) {
            innerFunction += MathParser.OperandToText(args.Arguments[index], this);
            if (index < args.Length - 1) {
                innerFunction += MathParser.Enumerator;
            }
        }
        return innerFunction;
    }
    UnaryOperationToString(operand) {
        var innerFunction = this.ArgumentsToString(operand.Arguments);
        switch (operand.Func.Type) {
            case "negative":
                let argumentValue = operand.Arguments.Arguments[0].Value;
                if (!(argumentValue instanceof BinaryOperation)) {
                    return "-" + innerFunction + "";
                }
                else {
                    return "-(" + innerFunction + ")";
                }
            case "ln":
                return `log(${innerFunction};e)`;
            case "log":
                return `log(${MathParser.OperandToText(operand.Arguments.Arguments[0], this)};${MathParser.OperandToText(operand.Arguments.Arguments[1], this)})`;
            case "rand":
                return "rand(" + innerFunction + ")";
            case "root":
                return `root(${MathParser.OperandToText(operand.Arguments.Arguments[0], this)};${MathParser.OperandToText(operand.Arguments.Arguments[1], this)})`;
            case "!":
                return "not (" + innerFunction + ")";
            case "exp":
                return "e^{" + innerFunction + "}";
            case "floor":
                return "⌊" + innerFunction + "⌋";
            case "round":
                return "round(" + innerFunction + ")";
            case "ceil":
                return "⌈" + innerFunction + "⌉";
            case "abs":
                return "|" + innerFunction + "|";
            case "f'":
                return "(" + innerFunction + ")`";
            case "fact":
                return innerFunction + "!";
            case "sign":
                return "sgn(" + innerFunction + ")";
            default:
                return operand.Func.Type + "(" + innerFunction + ")";
        }
    }
    BinaryOperationToString(operation, firstOperand, secondOperand) {
        let fixedOperands = this.Braces(operation, firstOperand, secondOperand);
        firstOperand = fixedOperands.firstOperand;
        secondOperand = fixedOperands.secondOperand;
        return `${firstOperand} ${operation.Operator.Value} ${secondOperand}`;
    }
}
class MathParser {
    static IsBasicOperator(value) {
        let result = false;
        MathParser.Operators.forEach((oper) => {
            if (!result) {
                result = oper.Value == value;
            }
        });
        return result;
    }
    static CalculateOperators(expression, operands) {
        let split = Extensions.split(expression, MathParser.OperandKey);
        let calculate = (oper) => {
            let sign = 1;
            for (let index = oper.length - 1; !MathParser.IsBasicOperator(oper); index--) {
                if (oper[index] == '-' && index >= 0) {
                    sign = -sign;
                    oper = oper.substr(0, oper.length - 1);
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
    static GetOperands(expression, parameters, addedOperands) {
        let operands = [];
        if (addedOperands != null) {
            operands = operands.concat(addedOperands);
        }
        let lastIndex = 0;
        let operators = [];
        MathParser.Operators.forEach((oper) => {
            operators.push(oper.Value);
        });
        let addOperand = (start, end) => {
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
    static GroupBinaryOperations(expression, operands, level) {
        let split = Extensions.split(expression, MathParser.OperandKey);
        let operators = [];
        MathParser.Operators.forEach((oper) => {
            if (level == oper.OperatorLevel) {
                operators.push(oper);
            }
        });
        for (let token = 1; token < split.length - 1;) {
            let currentOperator;
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
    static SplitExpression(expression, parameters, operands) {
        let calculatedOperands = MathParser.GetOperands(expression, parameters, operands);
        let calculatedOperators = MathParser.CalculateOperators(calculatedOperands.expression, calculatedOperands.operands);
        let thirdLevel = MathParser.GroupBinaryOperations(calculatedOperators.expression, calculatedOperators.operands, OperatorPrecedence.Third);
        let secondLevel = MathParser.GroupBinaryOperations(thirdLevel.expression, thirdLevel.operands, OperatorPrecedence.Second);
        let firstLevel = MathParser.GroupBinaryOperations(secondLevel.expression, secondLevel.operands, OperatorPrecedence.First);
        return firstLevel.operands[MathParser.ParseOperandIndex(firstLevel.expression)];
    }
    static ParseOperand(operand, parameters, addedOperands) {
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
            return new Operand(allParameters.get(operand));
        }
        else if (operand.indexOf(MathParser.Enumerator) != -1) {
            let args = Extensions.split(operand, MathParser.Enumerator);
            let operands = [];
            for (let index = 0; index < args.length; index++) {
                operands.push(MathParser.SplitExpression(args[index], parameters, addedOperands));
            }
            return new Operand(new ArgumentArray(operands));
        }
        else {
            let returnValue;
            let suitableFunctions = [];
            MathParser.Functions.forEach((func) => {
                if (func.Type.length < operand.length && operand.substr(0, func.Type.length) == func.Type) {
                    suitableFunctions.push(func);
                }
            });
            if (suitableFunctions.length == 0) {
                if (!operand.includes(MathParser.OperandKey)) {
                    return new Operand(new Parameter(operand, 0));
                }
                else {
                    throw new Error(`Function ${operand.split(MathParser.OperandKey)[0]} wasn't found`);
                }
            }
            let mostSuitableFunction = suitableFunctions[0];
            suitableFunctions.forEach((func) => {
                if (mostSuitableFunction) {
                    if (func.Type.length > mostSuitableFunction.Type.length) {
                        mostSuitableFunction = func;
                    }
                }
            });
            let innerExpression = operand.substr(mostSuitableFunction.Type.length, operand.length - mostSuitableFunction.Type.length);
            let value = MathParser.ParseOperand(innerExpression, parameters, addedOperands);
            if (value.Value instanceof ArgumentArray) {
                if (value.Value.Length != mostSuitableFunction.ArgumentsCount) {
                    throw new Error(`Function doesn't take ${value.Value.Length} arguments`);
                }
                else {
                    returnValue = new Operand(new UnaryOperation(value.Value, mostSuitableFunction));
                }
            }
            else if (1 != mostSuitableFunction.ArgumentsCount) {
                throw new Error("Function doesn't take 1 argument");
            }
            else {
                returnValue = new Operand(new UnaryOperation(new ArgumentArray([value]), mostSuitableFunction));
            }
            return returnValue;
        }
    }
    static GetParameters(parameters) {
        let output = new Map();
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
    static ParseOperandIndex(operand) {
        return parseInt(Extensions.replaceAll(MathParser.OperandKey, "", operand));
    }
    static OpenBraces(expression, parameters) {
        let operands = [];
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
            if (expressionToEvaluate.indexOf(MathParser.Enumerator) != -1) {
                let resultOperand = MathParser.ParseOperand(expressionToEvaluate, parameters, operands);
                operands.push(resultOperand);
            }
            else {
                let resultOperand = MathParser.SplitExpression(expressionToEvaluate, parameters, operands);
                operands.push(resultOperand);
            }
            expression = Extensions.replaceAll(expressionToReplace, `${MathParser.OperandKey}${operands.length - 1}${MathParser.OperandKey}`, expression);
            if (expressionLast == expression) {
                throw new Error(`Too many open braces`);
            }
        }
        if (expression.includes(")")) {
            throw new Error(`Too many closing braces`);
        }
        return { operands: operands, expression: expression };
    }
    static Parse(expression, parameters) {
        expression = expression.replace(/\s/gi, "").replace(/\,/gi, ".");
        let openedBraces = MathParser.OpenBraces(expression, parameters);
        return MathParser.SplitExpression(openedBraces.expression, parameters, openedBraces.operands);
    }
    static Preprocess(operand) {
        if (operand.Value instanceof ArgumentArray) {
            let array = [];
            operand.Value.Arguments.forEach((operand) => { array.push(MathParser.Preprocess(operand)); });
            let result = new ArgumentArray(array);
            return new Operand(result);
        }
        else if (operand.Value instanceof UnaryOperation && operand.Value.Func instanceof Preprocessor) {
            if (operand.Value.Arguments.Length == 1) {
                let result = operand.Value.Func.Func(MathParser.Preprocess(operand.Value.Arguments.Arguments[0]));
                return result;
            }
            else {
                throw new Error("Incorrect input");
            }
        }
        else if (operand.Value instanceof UnaryOperation && operand.Value.Func instanceof MathFunction) {
            let result = ExpressionBuilder.UnaryOperation(operand.Value.Func, MathParser.Preprocess(new Operand(operand.Value.Arguments)).Value.Arguments);
            return result;
        }
        else if (operand.Value instanceof BinaryOperation) {
            let result = new BinaryOperation(MathParser.Preprocess(operand.Value.FirstOperand), MathParser.Preprocess(operand.Value.SecondOperand), operand.Value.Operator);
            return new Operand(result);
        }
        else {
            return operand;
        }
    }
    static Evaluate(operation) {
        let firstOperand = MathParser.EvaluateOperand(operation.FirstOperand);
        let secondOperand = MathParser.EvaluateOperand(operation.SecondOperand);
        switch (operation.Operator.Value) {
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
    static EvaluateOperand(operand) {
        operand = MathParser.Preprocess(operand);
        if (typeof operand.Value == "number" || typeof operand.Value == "boolean") {
            return operand.Value;
        }
        else if (operand.Value instanceof Parameter) {
            return operand.Value.Value;
        }
        else if (operand.Value instanceof UnaryOperation && operand.Value.Func instanceof MathFunction) {
            let evaluatedArguments = [];
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
    static OperandToText(operand, visitor) {
        let output = "";
        if (typeof operand.Value == "number" || typeof operand.Value == "boolean") {
            output += visitor.LiteralToString(operand.Value);
        }
        else if (operand.Value instanceof Parameter) {
            output += visitor.ParameterToString(operand.Value);
        }
        else if (operand.Value instanceof UnaryOperation) {
            output += visitor.UnaryOperationToString(operand.Value);
        }
        else if (operand.Value instanceof BinaryOperation) {
            output += MathParser.BinaryOperationToLatexFormula(operand.Value, visitor);
        }
        else {
            return "";
        }
        return output;
    }
    static BinaryOperationToLatexFormula(operation, visitor) {
        let firstOperand = MathParser.OperandToText(operation.FirstOperand, visitor);
        let secondOperand = MathParser.OperandToText(operation.SecondOperand, visitor);
        return visitor.BinaryOperationToString(operation, firstOperand, secondOperand);
    }
}
MathParser.Operators = [
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
MathParser.OperandKey = "#";
MathParser.Enumerator = ";";
MathParser.Constants = [new Parameter("pi", Math.PI), new Parameter("e", Math.E), new Parameter("false", false), new Parameter("true", true), new Parameter("infinity", Number.POSITIVE_INFINITY)];
MathParser.NegativeFunction = new MathFunction("negative", 1, (value) => { return -Extensions.asNumber(value[0]); });
MathParser.Functions = [
    new MathFunction("rad", 1, (value) => { return Extensions.asNumber(value[0]) / 180.0 * Math.PI; }),
    new MathFunction("deg", 1, (value) => { return Extensions.asNumber(value[0]) * 180.0 / Math.PI; }),
    new MathFunction("cos", 1, (value) => { return Math.cos(Extensions.asNumber(value[0])); }),
    new MathFunction("sin", 1, (value) => { return Math.sin(Extensions.asNumber(value[0])); }),
    new MathFunction("tan", 1, (value) => { return Math.sin(Extensions.asNumber(value[0])) / Math.cos(Extensions.asNumber(value[0])); }),
    new MathFunction("cot", 1, (value) => { return Math.cos(Extensions.asNumber(value[0])) / Math.sin(Extensions.asNumber(value[0])); }),
    new MathFunction("cosh", 1, (value) => { return Math.cosh(Extensions.asNumber(value[0])); }),
    new MathFunction("sinh", 1, (value) => { return Math.sinh(Extensions.asNumber(value[0])); }),
    new MathFunction("tanh", 1, (value) => { return Math.sinh(Extensions.asNumber(value[0])) / Math.cosh(Extensions.asNumber(value[0])); }),
    new MathFunction("coth", 1, (value) => { return Math.cosh(Extensions.asNumber(value[0])) / Math.sinh(Extensions.asNumber(value[0])); }),
    new MathFunction("acos", 1, (value) => { return Math.acos(Extensions.asNumber(value[0])); }),
    new MathFunction("asin", 1, (value) => { return Math.asin(Extensions.asNumber(value[0])); }),
    new MathFunction("atan", 1, (value) => { return Math.atan(Extensions.asNumber(value[0])); }),
    new MathFunction("acot", 1, (value) => { return Math.atan(1 / Extensions.asNumber(value[0])); }),
    new MathFunction("acosh", 1, (value) => { return Math.acosh(Extensions.asNumber(value[0])); }),
    new MathFunction("asinh", 1, (value) => { return Math.asinh(Extensions.asNumber(value[0])); }),
    new MathFunction("atanh", 1, (value) => { return Math.atanh(Extensions.asNumber(value[0])); }),
    new MathFunction("acoth", 1, (value) => { return Math.atanh(1 / Extensions.asNumber(value[0])); }),
    new MathFunction("sqrt", 1, (value) => { return Math.sqrt(Extensions.asNumber(value[0])); }),
    new MathFunction("cbrt", 1, (value) => { return Math.pow(Extensions.asNumber(value[0]), 1.0 / 3.0); }),
    new MathFunction("ln", 1, (value) => { return Math.log(Extensions.asNumber(value[0])); }),
    new MathFunction("abs", 1, (value) => { return Math.abs(Extensions.asNumber(value[0])); }),
    new MathFunction("sign", 1, (value) => { return Math.sign(Extensions.asNumber(value[0])); }),
    new MathFunction("exp", 1, (value) => { return Math.exp(Extensions.asNumber(value[0])); }),
    new MathFunction("floor", 1, (value) => { return Math.floor(Extensions.asNumber(value[0])); }),
    new MathFunction("ceil", 1, (value) => { return Math.ceil(Extensions.asNumber(value[0])); }),
    new MathFunction("round", 1, (value) => { return Math.round(Extensions.asNumber(value[0])); }),
    new MathFunction("!", 1, (value) => { return !Extensions.asBoolean(value[0]); }),
    new MathFunction("fact", 1, (value) => { let result = 1; for (let i = 1; i <= Extensions.asNumber(value[0]); i++) {
        result *= i;
    } return result; }),
    new Preprocessor("f'", 1, (value) => { return AnalyticalMath.Derivative(value); }),
    new MathFunction("rand", 2, (value) => { return Math.random() * (Extensions.asNumber(value[1]) - Extensions.asNumber(value[0])) + Extensions.asNumber(value[0]); }),
    new MathFunction("log", 2, (value) => { return Math.log(Extensions.asNumber(value[0])) / Math.log(Extensions.asNumber(value[1])); }),
    new MathFunction("root", 2, (value) => { return Math.pow(Extensions.asNumber(value[0]), 1 / Extensions.asNumber(value[1])); })
];
class ExpressionBuilder {
    static FindFunction(name) {
        const func = MathParser.Functions.find((value) => {
            if (value.Type == name) {
                return true;
            }
            else {
                return false;
            }
        });
        if (!func) {
            throw new Error(`Function ${name} wasn't found`);
        }
        else {
            return func;
        }
    }
    static FindOperator(oper) {
        const operator = MathParser.Operators.find((value) => {
            if (value.Value == oper) {
                return true;
            }
            else {
                return false;
            }
        });
        if (!operator) {
            throw new Error(`Operator ${oper} wasn't found`);
        }
        else {
            return operator;
        }
    }
    static FindConstant(constant) {
        const parameter = MathParser.Constants.find((value) => {
            if (value.Name == constant) {
                return true;
            }
            else {
                return false;
            }
        });
        if (!parameter) {
            throw new Error(`Constant ${constant} wasn't found`);
        }
        else {
            return new Operand(parameter);
        }
    }
    static Literal(value) {
        return new Operand(value);
    }
    static Parameter(name, value) {
        return new Operand(new Parameter(name, value));
    }
    static UnaryOperation(func, argument, ...args) {
        const argsList = argument === null || argument === void 0 ? void 0 : argument.concat(args);
        return new Operand(new UnaryOperation(new ArgumentArray(argsList ? argsList : args), typeof func == "string" ? ExpressionBuilder.FindFunction(func) : func));
    }
    static BinaryOperation(firstOperand, secondOperand, operator) {
        return new Operand(new BinaryOperation(firstOperand, secondOperand, ExpressionBuilder.FindOperator(operator)));
    }
}
class AnalyticalMath {
    static Derivative(value) {
        if (typeof value.Value == "number" || typeof value.Value == "boolean") {
            return ExpressionBuilder.Literal(0);
        }
        else if (value.Value instanceof Parameter) {
            if (value.Value.Name == "x") {
                return ExpressionBuilder.Literal(1);
            }
            else {
                return ExpressionBuilder.Literal(0);
            }
        }
        else if (value.Value instanceof UnaryOperation) {
            switch (value.Value.Func.Type) {
                case "cos":
                    return ExpressionBuilder.BinaryOperation(ExpressionBuilder.UnaryOperation(MathParser.NegativeFunction, undefined, ExpressionBuilder.UnaryOperation("sin", value.Value.Arguments.Arguments)), AnalyticalMath.Derivative(value.Value.Arguments.Arguments[0]), "*");
                case "sin":
                    return ExpressionBuilder.BinaryOperation(ExpressionBuilder.UnaryOperation("cos", value.Value.Arguments.Arguments), AnalyticalMath.Derivative(value.Value.Arguments.Arguments[0]), "*");
                case "tan":
                    return ExpressionBuilder.BinaryOperation(ExpressionBuilder.BinaryOperation(ExpressionBuilder.Literal(1), ExpressionBuilder.BinaryOperation(ExpressionBuilder.UnaryOperation("cos", value.Value.Arguments.Arguments), ExpressionBuilder.Literal(2), "^"), "/"), AnalyticalMath.Derivative(value.Value.Arguments.Arguments[0]), "*");
                case "cot":
                    return ExpressionBuilder.UnaryOperation(MathParser.NegativeFunction, undefined, ExpressionBuilder.BinaryOperation(ExpressionBuilder.BinaryOperation(ExpressionBuilder.Literal(1), ExpressionBuilder.BinaryOperation(ExpressionBuilder.UnaryOperation("sin", value.Value.Arguments.Arguments), ExpressionBuilder.Literal(2), "^"), "/"), AnalyticalMath.Derivative(value.Value.Arguments.Arguments[0]), "*"));
                case "acos":
                    return ExpressionBuilder.BinaryOperation(ExpressionBuilder.BinaryOperation(ExpressionBuilder.Literal(1), ExpressionBuilder.UnaryOperation(MathParser.NegativeFunction, undefined, ExpressionBuilder.UnaryOperation("sin", undefined, ExpressionBuilder.UnaryOperation("acos", value.Value.Arguments.Arguments))), "/"), AnalyticalMath.Derivative(value.Value.Arguments.Arguments[0]), "*");
                case "asin":
                    return ExpressionBuilder.BinaryOperation(ExpressionBuilder.BinaryOperation(ExpressionBuilder.Literal(1), ExpressionBuilder.UnaryOperation("cos", undefined, ExpressionBuilder.UnaryOperation("asin", value.Value.Arguments.Arguments)), "/"), AnalyticalMath.Derivative(value.Value.Arguments.Arguments[0]), "*");
                case "atan":
                    return ExpressionBuilder.BinaryOperation(ExpressionBuilder.BinaryOperation(ExpressionBuilder.Literal(1), ExpressionBuilder.BinaryOperation(ExpressionBuilder.Literal(1), ExpressionBuilder.BinaryOperation(value.Value.Arguments.Arguments[0], ExpressionBuilder.Literal(2), "^"), "+"), "/"), AnalyticalMath.Derivative(value.Value.Arguments.Arguments[0]), "*");
                case "acot":
                    return ExpressionBuilder.BinaryOperation(ExpressionBuilder.UnaryOperation(MathParser.NegativeFunction, undefined, ExpressionBuilder.BinaryOperation(ExpressionBuilder.Literal(1), ExpressionBuilder.BinaryOperation(ExpressionBuilder.Literal(1), ExpressionBuilder.BinaryOperation(value.Value.Arguments.Arguments[0], ExpressionBuilder.Literal(2), "^"), "+"), "/")), AnalyticalMath.Derivative(value.Value.Arguments.Arguments[0]), "*");
                case "cosh":
                    return ExpressionBuilder.BinaryOperation(ExpressionBuilder.UnaryOperation("sinh", value.Value.Arguments.Arguments), AnalyticalMath.Derivative(value.Value.Arguments.Arguments[0]), "*");
                case "sinh":
                    return ExpressionBuilder.BinaryOperation(ExpressionBuilder.UnaryOperation("cosh", value.Value.Arguments.Arguments), AnalyticalMath.Derivative(value.Value.Arguments.Arguments[0]), "*");
                case "tanh":
                    return ExpressionBuilder.BinaryOperation(ExpressionBuilder.BinaryOperation(ExpressionBuilder.Literal(1), ExpressionBuilder.BinaryOperation(ExpressionBuilder.UnaryOperation("cosh", value.Value.Arguments.Arguments), ExpressionBuilder.Literal(2), "^"), "/"), AnalyticalMath.Derivative(value.Value.Arguments.Arguments[0]), "*");
                case "coth":
                    return ExpressionBuilder.UnaryOperation(MathParser.NegativeFunction, undefined, ExpressionBuilder.BinaryOperation(ExpressionBuilder.BinaryOperation(ExpressionBuilder.Literal(1), ExpressionBuilder.BinaryOperation(ExpressionBuilder.UnaryOperation("sinh", value.Value.Arguments.Arguments), ExpressionBuilder.Literal(2), "^"), "/"), AnalyticalMath.Derivative(value.Value.Arguments.Arguments[0]), "*"));
                case "acosh":
                    return ExpressionBuilder.BinaryOperation(ExpressionBuilder.BinaryOperation(ExpressionBuilder.Literal(1), ExpressionBuilder.UnaryOperation("sinh", undefined, ExpressionBuilder.UnaryOperation("acosh", value.Value.Arguments.Arguments)), "/"), AnalyticalMath.Derivative(value.Value.Arguments.Arguments[0]), "*");
                case "asinh":
                    return ExpressionBuilder.BinaryOperation(ExpressionBuilder.BinaryOperation(ExpressionBuilder.Literal(1), ExpressionBuilder.UnaryOperation("cosh", undefined, ExpressionBuilder.UnaryOperation("asinh", value.Value.Arguments.Arguments)), "/"), AnalyticalMath.Derivative(value.Value.Arguments.Arguments[0]), "*");
                case "atanh":
                    return ExpressionBuilder.BinaryOperation(ExpressionBuilder.Literal(1), ExpressionBuilder.BinaryOperation(ExpressionBuilder.Literal(1), ExpressionBuilder.BinaryOperation(value.Value.Arguments.Arguments[0], ExpressionBuilder.Literal(2), "^"), "-"), "/");
                case "acoth":
                    return ExpressionBuilder.BinaryOperation(ExpressionBuilder.Literal(1), ExpressionBuilder.BinaryOperation(ExpressionBuilder.Literal(1), ExpressionBuilder.BinaryOperation(value.Value.Arguments.Arguments[0], ExpressionBuilder.Literal(2), "^"), "-"), "/");
                case "ln":
                    return ExpressionBuilder.BinaryOperation(AnalyticalMath.Derivative(value.Value.Arguments.Arguments[0]), value.Value.Arguments.Arguments[0], "/");
                case "log":
                    return AnalyticalMath.Derivative(ExpressionBuilder.BinaryOperation(ExpressionBuilder.UnaryOperation("ln", undefined, value.Value.Arguments.Arguments[0]), ExpressionBuilder.UnaryOperation("ln", undefined, value.Value.Arguments.Arguments[1]), "/"));
                case "exp":
                    return ExpressionBuilder.BinaryOperation(ExpressionBuilder.BinaryOperation(ExpressionBuilder.FindConstant("e"), value.Value.Arguments.Arguments[0], "^"), AnalyticalMath.Derivative(value.Value.Arguments.Arguments[0]), "*");
                case "abs":
                    return ExpressionBuilder.UnaryOperation("sign", undefined, value.Value.Arguments.Arguments[0]);
                case "sqrt":
                    return AnalyticalMath.Derivative(ExpressionBuilder.UnaryOperation("root", undefined, value.Value.Arguments.Arguments[0], ExpressionBuilder.Literal(2)));
                case "cbrt":
                    return AnalyticalMath.Derivative(ExpressionBuilder.UnaryOperation("root", undefined, value.Value.Arguments.Arguments[0], ExpressionBuilder.Literal(3)));
                case "root":
                    return ExpressionBuilder.BinaryOperation(ExpressionBuilder.UnaryOperation("root", undefined, value.Value.Arguments.Arguments[0], value.Value.Arguments.Arguments[1]), AnalyticalMath.Derivative(ExpressionBuilder.BinaryOperation(ExpressionBuilder.UnaryOperation("ln", undefined, value.Value.Arguments.Arguments[0]), value.Value.Arguments.Arguments[1], "/")), "*");
                case "negative":
                    return ExpressionBuilder.Literal(-1);
            }
        }
        else if (value.Value instanceof BinaryOperation) {
            switch (value.Value.Operator.Value) {
                case "+":
                    return ExpressionBuilder.BinaryOperation(AnalyticalMath.Derivative(value.Value.FirstOperand), AnalyticalMath.Derivative(value.Value.SecondOperand), "+");
                case "-":
                    return ExpressionBuilder.BinaryOperation(AnalyticalMath.Derivative(value.Value.FirstOperand), AnalyticalMath.Derivative(value.Value.SecondOperand), "-");
                case "*":
                    return ExpressionBuilder.BinaryOperation(ExpressionBuilder.BinaryOperation(AnalyticalMath.Derivative(value.Value.FirstOperand), value.Value.SecondOperand, "*"), ExpressionBuilder.BinaryOperation(value.Value.FirstOperand, AnalyticalMath.Derivative(value.Value.SecondOperand), "*"), "+");
                case "/":
                    return ExpressionBuilder.BinaryOperation(ExpressionBuilder.BinaryOperation(ExpressionBuilder.BinaryOperation(AnalyticalMath.Derivative(value.Value.FirstOperand), value.Value.SecondOperand, "*"), ExpressionBuilder.BinaryOperation(value.Value.FirstOperand, AnalyticalMath.Derivative(value.Value.SecondOperand), "*"), "-"), ExpressionBuilder.BinaryOperation(value.Value.SecondOperand, ExpressionBuilder.Literal(2), "^"), "/");
                case "^":
                    return ExpressionBuilder.BinaryOperation(ExpressionBuilder.BinaryOperation(value.Value.FirstOperand, value.Value.SecondOperand, "^"), AnalyticalMath.Derivative(ExpressionBuilder.BinaryOperation(ExpressionBuilder.UnaryOperation("ln", undefined, value.Value.FirstOperand), value.Value.SecondOperand, "*")), "*");
            }
        }
        throw new Error("Can't calc derivative");
    }
    static Simplify(operand) {
        switch (operand.Value.constructor) {
            case UnaryOperation:
                return AnalyticalMath.SimplifyUnaryOperation(operand);
            case BinaryOperation:
                return AnalyticalMath.SimplifyBinaryOperation(operand.Value);
            default:
                return operand;
        }
    }
    static SimplifyUnaryOperation(operand) {
        if (!(operand.Value instanceof UnaryOperation)) {
            throw new Error(`${operand.Value} is not an unary operation`);
        }
        else if (operand.Value.Arguments.Length == 1) {
            const argument = AnalyticalMath.Simplify(operand.Value.Arguments.Arguments[0]);
            const func = operand.Value.Func;
            switch (func.Type) {
                case "sin":
                case "sinh":
                case "tan":
                case "tanh":
                case "asin":
                case "asinh":
                case "atan":
                case "atanh":
                    if (AnalyticalMath.Is0(argument)) {
                        return AnalyticalMath.const_0;
                    }
                    break;
                case "sec":
                case "cos":
                case "cosh":
                case "exp":
                    if (AnalyticalMath.Is0(argument)) {
                        return AnalyticalMath.const_1;
                    }
                    break;
                case "asec":
                case "acos":
                case "acosh":
                case "ln":
                    if (AnalyticalMath.Is1(argument)) {
                        return AnalyticalMath.const_0;
                    }
                    break;
                case "fact":
                    if (AnalyticalMath.Is0(argument) || AnalyticalMath.Is1(argument)) {
                        return AnalyticalMath.const_1;
                    }
                    break;
                case "abs":
                    if (AnalyticalMath.Is0(argument) || AnalyticalMath.Is1(argument)) {
                        return argument;
                    }
                    else if (AnalyticalMath.IsMinus1(argument)) {
                        return AnalyticalMath.const_1;
                    }
                    break;
                case "sqrt":
                    if (AnalyticalMath.Is0(argument) || AnalyticalMath.Is1(argument)) {
                        return argument;
                    }
                    break;
                case "floor":
                case "ceil":
                case "round":
                case "cbrt":
                    if (AnalyticalMath.Is0(argument) || AnalyticalMath.Is1(argument) || AnalyticalMath.IsMinus1(argument)) {
                        return argument;
                    }
                    break;
                case "negative":
                    if (AnalyticalMath.Is0(argument)) {
                        return AnalyticalMath.const_0;
                    }
                    else if (AnalyticalMath.Is1(argument)) {
                        return new Operand(-1.0);
                    }
                    else if (AnalyticalMath.IsMinus1(argument)) {
                        return AnalyticalMath.const_1;
                    }
                    break;
                default:
                    return new Operand(new UnaryOperation(new ArgumentArray([AnalyticalMath.Simplify(argument)]), func));
            }
            operand.Value.Arguments.Arguments[0] = argument;
        }
        else if (operand.Value.Arguments.Length == 2) {
            const argument = AnalyticalMath.Simplify(operand.Value.Arguments.Arguments[0]);
            const func = operand.Value.Func;
            switch (func.Type) {
                case "log":
                    if (AnalyticalMath.Is1(argument)) {
                        return AnalyticalMath.const_0;
                    }
                    break;
            }
        }
        if (operand.Value.Arguments.Length > 1) {
            for (let i = 0; i < operand.Value.Arguments.Length; i++) {
                const argument = AnalyticalMath.Simplify(operand.Value.Arguments.Arguments[i]);
                operand.Value.Arguments.Arguments[i] = argument;
            }
        }
        return operand;
    }
    static SimplifyBinaryOperation(binaryOperation) {
        switch (binaryOperation.Operator.Value) {
            case "+":
                return AnalyticalMath.SimplifyAdd(binaryOperation);
            case "-":
                return AnalyticalMath.SimplifySub(binaryOperation);
            case "*":
                return AnalyticalMath.SimplifyMul(binaryOperation);
            case "/":
                return AnalyticalMath.SimplifyDiv(binaryOperation);
            case "%":
                return AnalyticalMath.SimplifyMod(binaryOperation);
            case "^":
                return AnalyticalMath.SimplifyPower(binaryOperation);
            default:
                const first = AnalyticalMath.Simplify(binaryOperation.FirstOperand);
                const second = AnalyticalMath.Simplify(binaryOperation.SecondOperand);
                return new Operand(new BinaryOperation(first, second, binaryOperation.Operator));
        }
    }
    static Is0(operand) {
        return typeof operand.Value == "number" && Math.abs(operand.Value) == 0.0;
    }
    static Is1(operand) {
        return typeof operand.Value == "number" && operand.Value == 1.0;
    }
    static IsMinus1(operand) {
        return typeof operand.Value == "number" && operand.Value == -1.0;
    }
    static SimplifyAdd(binaryOperation) {
        const first = AnalyticalMath.Simplify(binaryOperation.FirstOperand);
        const second = AnalyticalMath.Simplify(binaryOperation.SecondOperand);
        if (AnalyticalMath.Is0(first)) {
            return second;
        }
        else if (AnalyticalMath.Is0(second)) {
            return first;
        }
        else {
            return new Operand(new BinaryOperation(first, second, binaryOperation.Operator));
        }
    }
    static SimplifySub(binaryOperation) {
        const second = AnalyticalMath.Simplify(binaryOperation.SecondOperand);
        if (AnalyticalMath.Is0(second)) {
            return AnalyticalMath.Simplify(binaryOperation.FirstOperand);
        }
        else {
            const first = AnalyticalMath.Simplify(binaryOperation.FirstOperand);
            return new Operand(new BinaryOperation(first, second, binaryOperation.Operator));
        }
    }
    static SimplifyMul(binaryOperation) {
        const first = AnalyticalMath.Simplify(binaryOperation.FirstOperand);
        const second = AnalyticalMath.Simplify(binaryOperation.SecondOperand);
        if (AnalyticalMath.Is0(first) || AnalyticalMath.Is1(second)) {
            return first;
        }
        else if (AnalyticalMath.Is0(second) || AnalyticalMath.Is1(first)) {
            return second;
        }
        else {
            return new Operand(new BinaryOperation(first, second, binaryOperation.Operator));
        }
    }
    static SimplifyDiv(binaryOperation) {
        const first = AnalyticalMath.Simplify(binaryOperation.FirstOperand);
        const second = AnalyticalMath.Simplify(binaryOperation.SecondOperand);
        if ((AnalyticalMath.Is0(first) && !AnalyticalMath.Is0(second)) || AnalyticalMath.Is1(second)) {
            return first;
        }
        else {
            return new Operand(new BinaryOperation(first, second, binaryOperation.Operator));
        }
    }
    static SimplifyMod(binaryOperation) {
        const first = AnalyticalMath.Simplify(binaryOperation.FirstOperand);
        if (AnalyticalMath.Is0(first)) {
            return AnalyticalMath.const_0;
        }
        else {
            const second = AnalyticalMath.Simplify(binaryOperation.SecondOperand);
            return new Operand(new BinaryOperation(first, second, binaryOperation.Operator));
        }
    }
    static SimplifyPower(binaryOperation) {
        const first = AnalyticalMath.Simplify(binaryOperation.FirstOperand);
        if (AnalyticalMath.Is1(first)) {
            return AnalyticalMath.const_1;
        }
        else {
            const second = AnalyticalMath.Simplify(binaryOperation.SecondOperand);
            return new Operand(new BinaryOperation(first, second, binaryOperation.Operator));
        }
    }
    static get const_0() {
        return new Operand(0.0);
    }
    static get const_1() {
        return new Operand(1.0);
    }
}
class UnitTests {
    static DisplayResult(received, expected, passed, type) {
        if (passed) {
            console.log(`%c Test ${type} passed. Received: ${received}, expected: ${expected} `, 'background: #0a0; color: #fff');
        }
        else {
            console.log(`%c Test ${type} failed. Received: ${received}, expected: ${expected} `, 'background: #a00; color: #fff');
        }
    }
    static DeclareTestCase(testCase) {
        UnitTests.TestCases.push(testCase);
    }
    static AreEqual(expression, expected) {
        let compared = UnitTests.EvaluateHelper(expression);
        let passed;
        if (typeof compared == "number" && typeof expected == "number") {
            passed = expected - UnitTests.Delta <= compared && expected + UnitTests.Delta >= compared;
        }
        else {
            passed = compared == expected;
        }
        UnitTests.DisplayResult(compared.toString(), expected.toString(), passed, `"${expression}"`);
    }
    static AreUnequal(expression, expected) {
        let compared = UnitTests.EvaluateHelper(expression);
        let passed;
        if (typeof compared == "number" && typeof expected == "number") {
            passed = !(expected - UnitTests.Delta <= compared && expected + UnitTests.Delta >= compared);
        }
        else {
            passed = compared != expected;
        }
        UnitTests.DisplayResult(compared.toString(), expected.toString(), passed, `"${expression}"`);
    }
    static ThrowError(expression) {
        try {
            let result = UnitTests.EvaluateHelper(expression);
            UnitTests.DisplayResult(result.toString(), "Error", false, `"${expression}"`);
        }
        catch {
            UnitTests.DisplayResult("Error", "Error", true, `"${expression}"`);
        }
    }
    static IsTrue(expression) {
        UnitTests.DisplayResult(expression ? "true" : "false", "true", expression, `"is true"`);
    }
    static EvaluateHelper(expression) {
        let parsed = MathParser.Parse(expression);
        let evaluated = MathParser.EvaluateOperand(parsed);
        return evaluated;
    }
    static RunTests() {
        UnitTests.TestCases.forEach((testCase) => {
            testCase();
        });
    }
}
UnitTests.TestCases = [];
UnitTests.Delta = 0.01;
function Evaluate() {
    const input = document.getElementById('inp');
    const result = document.getElementById('res');
    const expression = document.getElementById('expression');
    const simplifiedExpression = document.getElementById('simplifiedExpression');
    const expressionPlain = document.getElementById('expressionPlain');
    if (input && result && expression && expressionPlain && simplifiedExpression) {
        const userInput = input.value;
        const userExpression = MathParser.Preprocess(MathParser.Parse(userInput));
        result.innerHTML = `result: ${UnitTests.EvaluateHelper(userInput).toString()}`;
        expression.innerHTML = "$" + MathParser.OperandToText(userExpression, new LatexExpressionVisitor()) + "$";
        simplifiedExpression.innerHTML = "$" + MathParser.OperandToText(AnalyticalMath.Simplify(userExpression), new LatexExpressionVisitor()) + "$";
        expressionPlain.innerHTML = MathParser.OperandToText(userExpression, new PlainTextExpressionVisitor());
    }
}
UnitTests.DeclareTestCase(() => {
    const _0_plus_0 = AnalyticalMath.Simplify(MathParser.Parse("0+0"));
    UnitTests.IsTrue(MathParser.OperandToText(_0_plus_0, new PlainTextExpressionVisitor) == "0");
    const x_plus_0 = AnalyticalMath.Simplify(MathParser.Parse("x+0"));
    UnitTests.IsTrue(MathParser.OperandToText(x_plus_0, new PlainTextExpressionVisitor) == "x");
    const _0_plus_x = AnalyticalMath.Simplify(MathParser.Parse("0+x"));
    UnitTests.IsTrue(MathParser.OperandToText(_0_plus_x, new PlainTextExpressionVisitor) == "x");
});
UnitTests.DeclareTestCase(() => {
    const _0_minus_0 = AnalyticalMath.Simplify(MathParser.Parse("0-0"));
    UnitTests.IsTrue(MathParser.OperandToText(_0_minus_0, new PlainTextExpressionVisitor) == "0");
    const x_minus_0 = AnalyticalMath.Simplify(MathParser.Parse("x-0"));
    UnitTests.IsTrue(MathParser.OperandToText(x_minus_0, new PlainTextExpressionVisitor) == "x");
    const _0_minus_x = AnalyticalMath.Simplify(MathParser.Parse("0-x"));
    UnitTests.IsTrue(MathParser.OperandToText(_0_minus_x, new PlainTextExpressionVisitor) == "0 - x");
});
UnitTests.DeclareTestCase(() => {
    const _0_mul_0 = AnalyticalMath.Simplify(MathParser.Parse("0*0"));
    UnitTests.IsTrue(MathParser.OperandToText(_0_mul_0, new PlainTextExpressionVisitor) == "0");
    const x_mul_0 = AnalyticalMath.Simplify(MathParser.Parse("x*0"));
    UnitTests.IsTrue(MathParser.OperandToText(x_mul_0, new PlainTextExpressionVisitor) == "0");
    const _0_mul_x = AnalyticalMath.Simplify(MathParser.Parse("0*x"));
    UnitTests.IsTrue(MathParser.OperandToText(_0_mul_x, new PlainTextExpressionVisitor) == "0");
});
UnitTests.DeclareTestCase(() => {
    const _1_mul_1 = AnalyticalMath.Simplify(MathParser.Parse("1*1"));
    UnitTests.IsTrue(MathParser.OperandToText(_1_mul_1, new PlainTextExpressionVisitor) == "1");
    const x_mul_1 = AnalyticalMath.Simplify(MathParser.Parse("x*1"));
    UnitTests.IsTrue(MathParser.OperandToText(x_mul_1, new PlainTextExpressionVisitor) == "x");
    const _1_mul_x = AnalyticalMath.Simplify(MathParser.Parse("1*x"));
    UnitTests.IsTrue(MathParser.OperandToText(_1_mul_x, new PlainTextExpressionVisitor) == "x");
    const x_mul_1_mul_x = AnalyticalMath.Simplify(MathParser.Parse("x*1*x"));
    UnitTests.IsTrue(MathParser.OperandToText(x_mul_1_mul_x, new PlainTextExpressionVisitor) == "x * x");
});
UnitTests.DeclareTestCase(() => {
    const _0_div_0 = AnalyticalMath.Simplify(MathParser.Parse("0/0"));
    UnitTests.IsTrue(MathParser.OperandToText(_0_div_0, new PlainTextExpressionVisitor) == "0 / 0");
    const _0_div_expr = AnalyticalMath.Simplify(MathParser.Parse("0/sqrt(4-5)"));
    UnitTests.IsTrue(MathParser.OperandToText(_0_div_expr, new PlainTextExpressionVisitor) == "0");
    const _0_div_x = AnalyticalMath.Simplify(MathParser.Parse("0/(x-x)"));
    UnitTests.IsTrue(MathParser.OperandToText(_0_div_x, new PlainTextExpressionVisitor) == "0");
    const x_div_0 = AnalyticalMath.Simplify(MathParser.Parse("x/0"));
    UnitTests.IsTrue(MathParser.OperandToText(x_div_0, new PlainTextExpressionVisitor) == "x / 0");
});
UnitTests.DeclareTestCase(() => {
    const functions = ["sin", "sinh", "tan", "tanh", "asin", "asinh", "atan", "atanh",];
    for (const func of functions) {
        const expression = AnalyticalMath.Simplify(MathParser.Parse(`${func}(0)`));
        UnitTests.IsTrue(MathParser.OperandToText(expression, new PlainTextExpressionVisitor) == "0");
    }
    for (const func of functions) {
        const expression = AnalyticalMath.Simplify(MathParser.Parse(`${func}(x*2)`));
        UnitTests.IsTrue(MathParser.OperandToText(expression, new PlainTextExpressionVisitor) == `${func}(x * 2)`);
    }
});
UnitTests.DeclareTestCase(() => {
    const functions = ["cos", "cosh", "exp",];
    for (const func of functions) {
        const expression = AnalyticalMath.Simplify(MathParser.Parse(`${func}(0)`));
        UnitTests.IsTrue(MathParser.OperandToText(expression, new PlainTextExpressionVisitor) == "1");
    }
    for (const func of functions) {
        const expression = AnalyticalMath.Simplify(MathParser.Parse(`${func}(1)`));
        if (func == "exp") {
            UnitTests.IsTrue(MathParser.OperandToText(expression, new PlainTextExpressionVisitor) == "e^{1}");
        }
        else {
            UnitTests.IsTrue(MathParser.OperandToText(expression, new PlainTextExpressionVisitor) == `${func}(1)`);
        }
    }
});
UnitTests.DeclareTestCase(() => {
    const functions = ["acos", "acosh", "ln",];
    for (const func of functions) {
        const expression = AnalyticalMath.Simplify(MathParser.Parse(`${func}(1)`));
        UnitTests.IsTrue(MathParser.OperandToText(expression, new PlainTextExpressionVisitor) == "0");
    }
    for (const func of functions) {
        const expression = AnalyticalMath.Simplify(MathParser.Parse(`${func}(x-a)`));
        if (func == "ln") {
            UnitTests.IsTrue(MathParser.OperandToText(expression, new PlainTextExpressionVisitor) == "log(x - a;e)");
        }
        else {
            UnitTests.IsTrue(MathParser.OperandToText(expression, new PlainTextExpressionVisitor) == `${func}(x - a)`);
        }
    }
});
UnitTests.DeclareTestCase(() => {
    const expression = AnalyticalMath.Simplify(MathParser.Parse("log(1; 2.718)"));
    UnitTests.IsTrue(MathParser.OperandToText(expression, new PlainTextExpressionVisitor) == "0");
    const expression2 = AnalyticalMath.Simplify(MathParser.Parse("log(b; x)"));
    UnitTests.IsTrue(MathParser.OperandToText(expression2, new PlainTextExpressionVisitor) == "log(b;x)");
});
UnitTests.DeclareTestCase(() => {
    for (const argument of ["0", "1"]) {
        const expression = AnalyticalMath.Simplify(MathParser.Parse(`fact(${argument})`));
        UnitTests.IsTrue(MathParser.OperandToText(expression, new PlainTextExpressionVisitor) == "1");
    }
    const expression = AnalyticalMath.Simplify(MathParser.Parse("fact(x/y)"));
    UnitTests.IsTrue(MathParser.OperandToText(expression, new PlainTextExpressionVisitor) == "x / y!");
});
UnitTests.DeclareTestCase(() => {
    const expression1 = AnalyticalMath.Simplify(MathParser.Parse("abs(0)"));
    UnitTests.IsTrue(MathParser.OperandToText(expression1, new PlainTextExpressionVisitor) == "0");
    const expression2 = AnalyticalMath.Simplify(MathParser.Parse("abs(1)"));
    UnitTests.IsTrue(MathParser.OperandToText(expression2, new PlainTextExpressionVisitor) == "1");
    const expression3 = AnalyticalMath.Simplify(MathParser.Parse("abs(-1)"));
    UnitTests.IsTrue(MathParser.OperandToText(expression3, new PlainTextExpressionVisitor) == "1");
    const expression4 = AnalyticalMath.Simplify(MathParser.Parse("abs(x)"));
    UnitTests.IsTrue(MathParser.OperandToText(expression4, new PlainTextExpressionVisitor) == "|x|");
});
UnitTests.DeclareTestCase(() => {
    const expression1 = AnalyticalMath.Simplify(MathParser.Parse("sqrt(0)"));
    UnitTests.IsTrue(MathParser.OperandToText(expression1, new PlainTextExpressionVisitor) == "0");
    const expression2 = AnalyticalMath.Simplify(MathParser.Parse("sqrt(1)"));
    UnitTests.IsTrue(MathParser.OperandToText(expression2, new PlainTextExpressionVisitor) == "1");
    const expression3 = AnalyticalMath.Simplify(MathParser.Parse("sqrt(x^2)"));
    UnitTests.IsTrue(MathParser.OperandToText(expression3, new PlainTextExpressionVisitor) == "sqrt(x ^ 2)");
});
UnitTests.DeclareTestCase(() => {
    const expression1 = AnalyticalMath.Simplify(MathParser.Parse("-0"));
    UnitTests.IsTrue(MathParser.OperandToText(expression1, new PlainTextExpressionVisitor) == "0");
    const expression2 = AnalyticalMath.Simplify(MathParser.Parse("-1"));
    UnitTests.IsTrue(MathParser.OperandToText(expression2, new PlainTextExpressionVisitor) == "-1");
    const expression3 = AnalyticalMath.Simplify(MathParser.Parse("-(-1)"));
    UnitTests.IsTrue(MathParser.OperandToText(expression3, new PlainTextExpressionVisitor) == "1");
});
UnitTests.DeclareTestCase(() => {
    const functions = ["floor", "ceil", "round", "cbrt",];
    const values = [-1, 0, 1];
    for (const func of functions) {
        for (const value of values) {
            const expression = AnalyticalMath.Simplify(MathParser.Parse(`${func}(${value})`));
            UnitTests.IsTrue(MathParser.OperandToText(expression, new PlainTextExpressionVisitor) == `${value}`);
        }
    }
    const expression1 = AnalyticalMath.Simplify(MathParser.Parse("floor(5*x)"));
    UnitTests.IsTrue(MathParser.OperandToText(expression1, new PlainTextExpressionVisitor) == "⌊5 * x⌋");
    const expression2 = AnalyticalMath.Simplify(MathParser.Parse("ceil(x/y)"));
    UnitTests.IsTrue(MathParser.OperandToText(expression2, new PlainTextExpressionVisitor) == "⌈x / y⌉");
    const expression3 = AnalyticalMath.Simplify(MathParser.Parse("round(b^b)"));
    UnitTests.IsTrue(MathParser.OperandToText(expression3, new PlainTextExpressionVisitor) == "round(b ^ b)");
    const expression4 = AnalyticalMath.Simplify(MathParser.Parse("cbrt(sin(x))"));
    UnitTests.IsTrue(MathParser.OperandToText(expression4, new PlainTextExpressionVisitor) == "cbrt(sin(x))");
});
UnitTests.DeclareTestCase(() => {
    const expression1 = AnalyticalMath.Simplify(MathParser.Parse("0%1"));
    UnitTests.IsTrue(MathParser.OperandToText(expression1, new PlainTextExpressionVisitor) == "0");
    const expression2 = AnalyticalMath.Simplify(MathParser.Parse("0%0"));
    UnitTests.IsTrue(MathParser.OperandToText(expression2, new PlainTextExpressionVisitor) == "0");
    const expression3 = AnalyticalMath.Simplify(MathParser.Parse("0%x"));
    UnitTests.IsTrue(MathParser.OperandToText(expression3, new PlainTextExpressionVisitor) == "0");
    const expression4 = AnalyticalMath.Simplify(MathParser.Parse("1%0"));
    UnitTests.IsTrue(MathParser.OperandToText(expression4, new PlainTextExpressionVisitor) == "1 % 0");
    const expression5 = AnalyticalMath.Simplify(MathParser.Parse("1%x"));
    UnitTests.IsTrue(MathParser.OperandToText(expression5, new PlainTextExpressionVisitor) == "1 % x");
});
UnitTests.DeclareTestCase(() => {
    for (const text_expression of ["1^0", "1^1", "1^-1", "1^x", "1^sin(x)"]) {
        const expression = AnalyticalMath.Simplify(MathParser.Parse(text_expression));
        UnitTests.IsTrue(MathParser.OperandToText(expression, new PlainTextExpressionVisitor) == "1");
    }
    const expression1 = AnalyticalMath.Simplify(MathParser.Parse("a^x"));
    UnitTests.IsTrue(MathParser.OperandToText(expression1, new PlainTextExpressionVisitor) == "a ^ x");
});
UnitTests.DeclareTestCase(() => {
    const expression1 = AnalyticalMath.Simplify(MathParser.Parse("((x + (x * (0 / (x * 2)))) * 1) / 1"));
    UnitTests.IsTrue(MathParser.OperandToText(expression1, new PlainTextExpressionVisitor) == "x");
    const expression2 = AnalyticalMath.Simplify(MathParser.Parse("(acos((x+sin(k/15))^0)+x)*cos(0*(w + 16 - m^x))*y"));
    UnitTests.IsTrue(MathParser.OperandToText(expression2, new PlainTextExpressionVisitor) == "x * y");
});
UnitTests.DeclareTestCase(() => {
    UnitTests.AreEqual("cos(3550/20)*20+100", Math.cos(3550 / 20.0) * 20 + 100);
});
UnitTests.DeclareTestCase(() => {
    UnitTests.AreEqual("4^(2*5^(1/2)+4)*2^(-3-4*5^(1/2))+(6^(3^(1/2))*7^(3^(1/2)))/(42^(3^(1/2)-1))+(-12)/((sin(131/180*3,1415926535897932384626433832795))^2+(sin(221/180*3,1415926535897932384626433832795))^2)+44*sqrt(3)*tan(-480/180*3,1415926535897932384626433832795)*46*tan(7/180*3,1415926535897932384626433832795)*tan(83/180*3,1415926535897932384626433832795)", 6134.0);
});
UnitTests.DeclareTestCase(() => {
    UnitTests.AreEqual("4^(2*5^(1/2)+4)*2^(-3-4*5^(1/2))+(6^(3^(1/2))*7^(3^(1/2)))/(42^(3^(1/2)-1))+(-12)/((sin(131/180*pi))^2+(sin(221/180*pi))^2)+44*sqrt(3)*tan(-480/180*pi)*46*tan(7/180*pi)*tan(83/180*pi)", 6134.0);
});
UnitTests.DeclareTestCase(() => {
    UnitTests.AreEqual("46*tan(7/180*3,1415926535897932384626433832795)*tan(83/180*3,1415926535897932384626433832795)", 46.0);
});
UnitTests.DeclareTestCase(() => {
    UnitTests.AreEqual("(-12)/((sin(131/180*3,1415926535897932384626433832795))^2+(sin(221/180*3,1415926535897932384626433832795))^2)", -12.0);
});
UnitTests.DeclareTestCase(() => {
    UnitTests.AreEqual("(6^(3^(1/2))*7^(3^(1/2)))/(42^(3^(1/2)-1))", 42.0);
});
UnitTests.DeclareTestCase(() => {
    UnitTests.AreEqual("4 ^ (2 * 5 ^ (1 / 2) + 4) * 2 ^ (-3 - 4 * 5 ^ (1 / 2))", 32.0);
});
UnitTests.DeclareTestCase(() => {
    UnitTests.AreEqual("cos(rad(sin(rad(deg(rad(30))))))", Math.cos(Math.sin(Math.PI / 6) / 180 * Math.PI));
});
UnitTests.DeclareTestCase(() => {
    UnitTests.AreEqual("deg(acos(cos(asin(sin(rad(30))))))", 30.0);
});
UnitTests.DeclareTestCase(() => {
    UnitTests.AreEqual("log(10^6;root(10^4;10+10))", 30.0);
});
UnitTests.DeclareTestCase(() => {
    UnitTests.AreEqual("log(10^6;root(10+10;10^4))", 46117.3);
});
UnitTests.DeclareTestCase(() => {
    UnitTests.AreUnequal("2+2", 5);
});
UnitTests.DeclareTestCase(() => {
    const expression = "sdgphjsdioghiosdnhiosd";
    const operand = MathParser.Parse(expression);
    UnitTests.IsTrue((operand.Value) instanceof Parameter);
    UnitTests.IsTrue((operand.Value).Name == expression);
});
UnitTests.DeclareTestCase(() => {
    UnitTests.ThrowError("sdgphjsdioghiosdnhiosd(0)");
});
UnitTests.DeclareTestCase(() => {
    UnitTests.AreEqual("3+-4", -1);
});
UnitTests.DeclareTestCase(() => {
    UnitTests.AreEqual("-2+3", 1);
});
UnitTests.DeclareTestCase(() => {
    UnitTests.ThrowError("1&3");
});
UnitTests.DeclareTestCase(() => {
    UnitTests.ThrowError("!(1)");
});
UnitTests.DeclareTestCase(() => {
    UnitTests.AreEqual("cossinlnraddeg(pi/2)", 0.9);
});
UnitTests.DeclareTestCase(() => {
    UnitTests.AreEqual("sincos(-2)", -0.4);
});
UnitTests.DeclareTestCase(() => {
    UnitTests.AreEqual("root(root(2;cossinlnraddeg(pi/2));log(pi;e))", 1.95);
});
UnitTests.DeclareTestCase(() => {
    UnitTests.AreEqual("sinh(10)", Math.sinh(10));
});
UnitTests.DeclareTestCase(() => {
    UnitTests.AreEqual("(e^10-e^(-10))/2", Math.sinh(10));
});
UnitTests.DeclareTestCase(() => {
    UnitTests.ThrowError("sinhh(10)");
});
UnitTests.RunTests();
//# sourceMappingURL=app.js.map