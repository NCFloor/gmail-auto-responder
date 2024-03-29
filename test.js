function testSendEmail() {
    var sampleEmail = "A website visitor has sent you a message:\n\n  Name : Sean P Kent\n\n  Address : 3030 Saint James Pl\n\n  Phone : 707-123-4567\n\n  Email : seanpkent@gmail.com\n\n  Message : Hello, \nmy name is sean.\nI need some floors.\n\nThanks\n\n  spamhash_response : north\n\n  IP Address : 111.111.111.111";
    var template = HtmlService.createTemplateFromFile("auto-response-template");
    template.originalMessage = cleanupMessage(sampleEmail);
    var body = template.evaluate().getContent();
    // Send reply
    MailApp.sendEmail({
        to: "sean@ncfloorandtile.com",
        subject: "Message Received | ncfloorandtile.com",
        htmlBody: body
    });
}
