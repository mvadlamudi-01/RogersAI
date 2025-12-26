const form = document.getElementById("contact-form");

form.addEventListener("submit", function (e) {
  e.preventDefault();

  emailjs.sendForm(
    "service_ids",
    "template_contact",
    this
  ).then(
    () => {
      alert("Message sent successfully!");
      form.reset();
    },
    (error) => {
      alert("Failed to send message. Please try again.");
      console.error(error);
    }
  );
});
