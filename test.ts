function testSendEmail() {
    const sampleEmail = `A website visitor has sent you a message:

  Name : Sean P Kent

  Address : 3030 Saint James Pl

  Phone : 7075999948

  Email : seanpkent@gmail.com

  Message : Hello, 
my name is sean.
I need some floors.

Thanks

  spamhash_response : north

  IP Address : 24.156.46.217`;


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