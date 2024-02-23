/**
 * Update config as needed
 */
var config = {
    subjectFilter: "Website Contact from ncfloorandtile.com",
    autoResponseSubject: "Message Received | ncfloorandtile.com",
    forwardTo: "jason@ncfloorandtile.com, kerry@ncfloorandtile.com, sean@ncfloorandtile.com",
    labelName: "Auto-replied",
    maxThreads: 100,
    startingThread: 0,
    replyCount: 0
};
function checkAndReply() {
    setupTrigger();
    var template = HtmlService.createTemplateFromFile("auto-response-template");
    var label = getLabel();
    var query = getQuery();
    while (true) {
        // Search for new threads
        var threads = GmailApp.search(query, config.startingThread, config.maxThreads);
        config.startingThread += config.maxThreads;
        threads.forEach(function (thread) {
            // Get last message in thread
            var message = thread.getMessages().at(-1);
            var originalBody = message.getBody();
            var email = extractEmail(originalBody);
            template.originalMessage = cleanupMessage(originalBody);
            var body = template.evaluate().getContent();
            // Send reply
            MailApp.sendEmail({
                to: email,
                subject: config.autoResponseSubject,
                htmlBody: body
            });
            // Forward message
            message.forward(config.forwardTo);
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
    var text = config.replyCount == 0
        ? "No new emails found."
        : config.replyCount == 1
            ? "Replied to one new email."
            : "Replied to ".concat(config.replyCount, " new emails.");
    console.log(text);
}
function getLabel() {
    var labels = GmailApp.getUserLabels().map(function (l) { return l.getName(); });
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
    var queryFilter = {
        subject: config.subjectFilter,
        "-label": config.labelName
    };
    return Object.entries(queryFilter)
        .map(function (e) { return e.join(":"); })
        .join(" ");
}
function removeTrigger() {
    var triggers = ScriptApp.getProjectTriggers();
    triggers.forEach(function (trigger) {
        if (trigger.getHandlerFunction() === "checkAndReply") {
            ScriptApp.deleteTrigger(trigger);
            console.log("deleted trigger");
        }
    });
}
function setupTrigger() {
    var triggers = ScriptApp.getProjectTriggers();
    if (triggers.length == 0) {
        ScriptApp.newTrigger("checkAndReply").timeBased().everyMinutes(1).create();
    }
}
/**
 * Remove everything except the original message, email, phone
 */
function cleanupMessage(message) {
    var regex = /(A website visitor has sent you a message|spamhash_response|IP Address).*/g;
    return message.replace(regex, "").trim();
}
/**
 * Extract email from the original message
 */
function extractEmail(message) {
    // Find email line
    var emailLine = message.match(/email : .+/gi)[0].split(" : ")[1];
    // Strip out any surrounding html
    return emailLine.replace(/<[^>]*>/g, "");
}
