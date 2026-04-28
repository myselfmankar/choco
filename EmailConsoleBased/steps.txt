# **Apex Program: Send Email Notification (With / Without Attachment)**

---

## **🔹 Aim**

To develop a console-based Apex program in Salesforce that sends an email notification using built-in messaging services, with and without attachment.

---

## **🔹 Prerequisites**

* Salesforce account (Developer Edition)
* Access to Developer Console
* Email Deliverability enabled

---

## **🔹 Step 1: Enable Email Sending**

1. Go to **Setup**
2. Search for **Deliverability**
3. Set:

   * **Access Level = All Email**
4. Click **Save**

---

## **🔹 Step 2: Open Developer Console**

1. Click on ⚙️ (Settings icon)
2. Select **Developer Console**

---

## **🔹 Step 3: Create Apex Class (Without Attachment)**

### **📄 File Name:** `SendEmailWithout.apxc`

### **Code:**

```apex
public class SendEmailWithout {

    public static void sendSimpleEmail() {

        // Create email object
        Messaging.SingleEmailMessage mail = new Messaging.SingleEmailMessage();

        // Set recipient email
        mail.setToAddresses(new String[] {'recipient@example.com'});

        // Set subject
        mail.setSubject('Test Email from Apex');

        // Set email body
        mail.setPlainTextBody('Hello,\n\nThis is a test email sent using Apex.\n\nThank You!');

        // Send email
        Messaging.sendEmail(new Messaging.SingleEmailMessage[] { mail });

        System.debug('Email Sent Successfully!');
    }
}
```

---

## **🔹 Step 4: Execute (Without Attachment)**

1. In Developer Console → Click **Debug → Open Execute Anonymous Window**
2. Run:

```apex
SendEmailWithout.sendSimpleEmail();
```

---

## **🔹 Step 5: Create Apex Class (With Attachment)**

### **📄 File Name:** `SendEmailWith.apxc`

### **Code:**

```apex
public class SendEmailWith {

    public static void sendEmailWithAttachment() {

        // Create email object
        Messaging.SingleEmailMessage mail = new Messaging.SingleEmailMessage();

        // Set recipient email
        mail.setToAddresses(new String[] {'recipient@example.com'});

        // Set subject
        mail.setSubject('Apex Email with Attachment');

        // Set email body
        mail.setPlainTextBody('Hello,\n\nPlease find the attachment.\n\nThank You!');

        // Create attachment
        Messaging.EmailFileAttachment attachment = new Messaging.EmailFileAttachment();
        attachment.setFileName('Sample.txt');
        attachment.setBody(Blob.valueOf('This is a sample attachment file.'));
        attachment.setContentType('text/plain');

        // Attach file
        mail.setFileAttachments(new Messaging.EmailFileAttachment[] { attachment });

        // Send email
        Messaging.sendEmail(new Messaging.SingleEmailMessage[] { mail });

        System.debug('Email with Attachment Sent Successfully!');
    }
}
```

---

## **🔹 Step 6: Execute (With Attachment)**

Run in Execute Anonymous Window:

```apex
SendEmailWith.sendEmailWithAttachment();
```

---

## **🔹 Output**

* Email is sent successfully to the specified recipient.
* In the second program, an attachment (`Sample.txt`) is included.

---

## **🔹 Important Points**

* Class used: `Messaging.SingleEmailMessage`
* Method used: `Messaging.sendEmail()`
* Attachment class: `Messaging.EmailFileAttachment`
* Email body can be:

  * `setPlainTextBody()`
  * `setHtmlBody()`

---

## **🔹 Conclusion**

Thus, we successfully created a console-based Apex program to send email notifications with and without attachments using Salesforce email services.

---


for multi line file content:
public class SendEmailWith {

    public static void sendEmailWithAttachment() {

        // Create email object
        Messaging.SingleEmailMessage mail = new Messaging.SingleEmailMessage();

        // Set recipient email
        mail.setToAddresses(new String[] {'recipient@example.com'});

        // Set subject
        mail.setSubject('Apex Email with Multi-line Attachment');

        // Set email body
        mail.setPlainTextBody('Hello,\n\nPlease find the multi-line attachment.\n\nThank You!');

        // Create attachment
        Messaging.EmailFileAttachment attachment = new Messaging.EmailFileAttachment();

        // Multi-line content using \n
        String content = 'Hello,\n' +
                         'This is a sample attachment file.\n' +
                         'It contains multiple lines of text.\n\n' +
                         'Line 4: Apex is powerful.\n' +
                         'Line 5: Email sent successfully.\n\n' +
                         'Regards,\nSalesforce';

        // Set attachment details
        attachment.setFileName('MultiLineSample.txt');
        attachment.setBody(Blob.valueOf(content));
        attachment.setContentType('text/plain');

        // Attach file to email
        mail.setFileAttachments(new Messaging.EmailFileAttachment[] { attachment });

        // Send email
        Messaging.sendEmail(new Messaging.SingleEmailMessage[] { mail });

        System.debug('Email with Multi-line Attachment Sent Successfully!');
    }
}