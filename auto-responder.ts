const config = {
  subjectFilter: "Website Contact from ncfloorandtile.com",
  labelName: "Auto-replied",
  maxThreads: 100,
  startingThread: 0,
  replyCount: 0,
};

function checkAndReply() {
  setupTrigger();

  const template = HtmlService.createTemplateFromFile("auto-response-template");
  const label = getLabel();
  const query = getQuery();

  while (true) {
    // Search for new threads
    const threads = GmailApp.search(query, config.startingThread, config.maxThreads);

    config.startingThread += config.maxThreads;

    threads.forEach((thread) => {
      // Get last message in thread
      const message = thread.getMessages().at(-1);
      const originalBody = message.getBody();
      const email = extractEmail(originalBody)

      template.originalMessage = cleanupMessage(originalBody)

      const body = template.evaluate().getContent();

      // Send reply
      MailApp.sendEmail({
        to: email,
        subject: "Message Received | ncfloorandtile.com",
        htmlBody: body
      })

      // Forward message
      message.forward("jason@ncfloorandtile.com, kerry@ncfloorandtile.com, sean@ncfloorandtile.com")

      // Label the thread as auto-replied
      label.addToThread(thread);

      // Count the replies
      config.replyCount++;
    });

    // Stop the loop if there are no more
    // new threads to process
    if (threads.length < config.maxThreads) {
      break;
    }
  }

  // Log the status
  const text =
    config.replyCount == 0
      ? "No new emails found."
      : config.replyCount == 1
        ? "Replied to one new email."
        : `Replied to ${config.replyCount} new emails.`;

  console.log(text);
}

function getLabel() {
  const labels = GmailApp.getUserLabels().map((l) => l.getName());
  if (!labels.includes(config.labelName)) {
    GmailApp.createLabel(config.labelName);
  }

  return GmailApp.getUserLabelByName(config.labelName);
}

/**
 * Prepare the search filter for emails containing
 * specific keywords in the subject line
 * and emails without the responded-to label
 */
function getQuery() {
  const queryFilter = {
    subject: config.subjectFilter,
    "-label": config.labelName,
  };

  return Object.entries(queryFilter)
    .map((e) => e.join(":"))
    .join(" ");
}

function removeTrigger() {
  const triggers = ScriptApp.getProjectTriggers();

  triggers.forEach(trigger => {
    if (trigger.getHandlerFunction() === "checkAndReply") {
      ScriptApp.deleteTrigger(trigger)
      console.log("deleted trigger")
    }
  })
}

function setupTrigger() {
  const triggers = ScriptApp.getProjectTriggers();

  if (triggers.length == 0) {
    ScriptApp.newTrigger("checkAndReply").timeBased().everyMinutes(1).create();
  }
}

/**
 * Remove everything except the original message, email, phone
 */
function cleanupMessage(message: string) {
  const regex = /(A website visitor has sent you a message|spamhash_response|IP Address).*/g;
  return message.replace(regex, "").trim();
}

/**
 * Extract email from the original message
 */
function extractEmail(message: string) {
  return message.match(/email : .+/gi)[0].split(" : ")[1]
}

