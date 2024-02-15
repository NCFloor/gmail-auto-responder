function testSendEmail() {
    const sampleEmail = `A website visitor has sent you a message:

  Name : Sean P Kent

  Address : 3030 Saint James Pl

  Phone : 707-123-4567

  Email : seanpkent@gmail.com

  Message : Hello, 
my name is sean.
I need some floors.

Thanks

  spamhash_response : north

  IP Address : 111.111.111.111`;


    const template = HtmlService.createTemplateFromFile("auto-response-template");

    template.originalMessage = cleanupMessage(sampleEmail)

    const body = template.evaluate().getContent();

    // Send reply
    MailApp.sendEmail({
        to: "sean@ncfloorandtile.com",
        subject: "Message Received | ncfloorandtile.com",
        htmlBody: body
    })
}