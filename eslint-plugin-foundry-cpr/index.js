module.exports.rules = {
  "logger-after-function-definition": (context) => ({
    MethodDefinition: (node) => {
      // context.report(node, "After a method definition a LOGGER.trace call is needed.");
      if (
        node
        && node.value
        && node.value.type === "FunctionExpression"
        && node.value.body
        && node.value.body.type === "BlockStatement"
        && node.value.body.body
      ) {
        if (node.value.body.body[0].type !== "ExpressionStatement") {
          context.report(node, "After a method definition a LOGGER.trace call is needed.");
        } else if (
          node.value.body.body[0].expression
          && node.value.body.body[0].expression.type === "CallExpression"
          && node.value.body.body[0].expression.callee
          && node.value.body.body[0].expression.callee.type === "MemberExpression"
          && node.value.body.body[0].expression.callee.object
          && node.value.body.body[0].expression.callee.object.name !== "LOGGER"
        ) {
          context.report(node, "After a method definition a LOGGER.trace call is needed.");
        }
      }
    },
  }),
};
