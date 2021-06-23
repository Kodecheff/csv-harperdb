$(document).ready(function() {
  const uploadForm = document.getElementById('csvUpload')

  uploadForm.addEventListener('submit', (e) => {
    e.preventDefault()
    const file = document.getElementById('csvFile')

    const formData = new FormData()

    formData.append("file", file.files[0])

    fetch("/upload", {
      method: "post",
      body: formData
    })
    .then((res) => {
      window.location.href = "/record"
    })
    .catch((err) => console.log("An error occured " + err))
  })
})