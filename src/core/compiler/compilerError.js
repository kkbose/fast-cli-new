class CompilerError extends Error {
  constructor(originLevel = 'project', ...params) {
    // Pass remaining arguments (including vendor specific ones) to parent constructor
    super(...params)

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, CompilerError)
    }

    this.name = 'CompilerError'
    // Custom debugging information
    this.foo = foo
    this.date = new Date()
  }
}
