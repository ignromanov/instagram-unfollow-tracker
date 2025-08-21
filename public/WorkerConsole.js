/*
 * WorkerConsole.js - Enhanced for ES Module Workers
 *
 * Modern version that supports both classic and ES module workers.
 * Intercepts console.log() calls from workers and forwards them to the main thread.
 *
 * Based on original by David Flanagan (2011)
 * Enhanced for ES modules support (2025)
 */
if (typeof window !== 'undefined' && window.console && window.console.log) {
  /*
   * Main thread: Wrap the Worker() constructor to intercept console messages
   */

  // Remember the original Worker() constructor
  window._Worker = Worker;

  // Make Worker writable so we can replace it
  Object.defineProperty(window, 'Worker', {
    writable: true,
    configurable: true,
    enumerable: false,
  });

  // Replace the Worker() constructor with this augmented version
  window.Worker = function Worker(url, options) {
    // Create a real Worker object with the original URL and options
    var w = new _Worker(url, options);

    // Create a side channel for the worker to send log messages on
    var channel = new MessageChannel();

    // Store the port for later use
    var logPort = channel.port1;

    // Listen for log messages on our end of the channel
    logPort.onmessage = function (e) {
      var data = e.data;

      if (data.type === 'console') {
        // Extract the method and arguments
        var method = data.method || 'log';
        var args = data.args || [];

        // Get worker identifier
        var workerName = typeof url === 'string' ? url : url.toString();

        // Forward to the appropriate console method
        if (console[method]) {
          console[method].apply(console, args);
        } else {
          console.log.apply(console, args);
        }
      }
    };

    // Send the other end of the channel to the worker
    // Use a small delay to ensure the worker is ready
    setTimeout(function () {
      try {
        w.postMessage({ type: '__console_init__', port: channel.port2 }, [channel.port2]);
      } catch (err) {
        // Silent error handling
      }
    }, 0);

    // Return the real Worker object from this fake constructor
    return w;
  };
} else if (typeof self !== 'undefined' && typeof importScripts !== 'undefined') {
  /*
   * Worker thread: Set up console forwarding to main thread
   */

  // Flag to track if console is initialized
  var consoleInitialized = false;
  var consolePort = null;
  var pendingLogs = [];

  // Use addEventListener to not interfere with worker's own message handlers
  self.addEventListener('message', function (e) {
    if (e.data && e.data.type === '__console_init__' && e.ports && e.ports[0]) {
      consolePort = e.ports[0];
      consoleInitialized = true;

      // Create console object that forwards to main thread
      self.console = createConsoleProxy(consolePort);

      // Send any pending logs
      pendingLogs.forEach(function (log) {
        consolePort.postMessage(log);
      });
      pendingLogs = [];
    }
  });

  // Create a console proxy that forwards to main thread
  function createConsoleProxy(port) {
    var methods = ['log', 'info', 'warn', 'error', 'debug', 'trace'];
    var consoleObj = {};

    methods.forEach(function (method) {
      consoleObj[method] = function () {
        var args = Array.prototype.slice.call(arguments);
        var message = {
          type: 'console',
          method: method,
          args: args,
        };

        if (consoleInitialized && port) {
          try {
            port.postMessage(message);
          } catch (err) {
            // Fallback: store in pending logs
            pendingLogs.push(message);
          }
        } else {
          // Store for later
          pendingLogs.push(message);
        }
      };
    });

    return consoleObj;
  }

  // Initialize console immediately with pending logs support
  if (!self.console) {
    self.console = createConsoleProxy(null);
  }
}
