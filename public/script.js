const form = document.querySelector(".compare-form");
const fileInputs = form.querySelectorAll('input[type="file"]');
const firstOutputBox = document.querySelector(".result.first");
const compareOutputBox = document.querySelector(".result.compare");
const labels = document.querySelectorAll("label");

function displayFileData(file, outputBox) {
  outputBox.querySelector(".file-name").textContent = file.name;
  outputBox.querySelector(".file-size").textContent = `${(
    file.size / 1024
  ).toFixed(2)} KB`;

  outputBox.style.display = "flex";
}

async function uploadFiles(files) {
  const formData = new FormData();

  files.forEach((fileInput) => {
    formData.append(fileInput.getAttribute("name"), fileInput.files?.[0]);
  });

  firstOutputBox.querySelector(".upload-result").innerHTML = `
    <i class="ph ph-circle-notch"></i>
  `;
  compareOutputBox.querySelector(".upload-result").innerHTML = `
    <i class="ph ph-circle-notch"></i>
  `;

  try {
    const response = await fetch(form.action, {
      method: "POST",
      body: formData,
    });
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(error.message);
  }
}

function displayStatus(uploaded) {
  console.log(uploaded);
  if (uploaded) {
    firstOutputBox.querySelector(".upload-result").innerHTML = `
          <span>Upload Successful</span>
          <i class="ph ph-check-circle"></i>
        `;
    compareOutputBox.querySelector(".upload-result").innerHTML = `
          <span>Upload Successful</span>
          <i class="ph ph-check-circle"></i>
        `;
    document.querySelector(".images").style.display = "flex";
    document.querySelector(".images .data").innerHTML = `
      <p>Number of different pixels: ${uploaded.mismatchedPixels}</p>
      <p>Match Percentage: ${uploaded.matchPercentage}</p>
      <p>Matches: ${uploaded.success}</p>
    `;
  } else {
    firstOutputBox.querySelector(".upload-result").innerHTML = `
          <span>Upload failed</span>
          <i class="ph ph-x-circle"></i>
        `;
    compareOutputBox.querySelector(".upload-result").innerHTML = `
          <span>Upload failed</span>
          <i class="ph ph-x-circle"></i>
        `;
  }
}

form.addEventListener("submit", async function (event) {
  event.preventDefault();
  console.log({ event });
  fileInputs.forEach((fileInput) => {
    const file = fileInput.files?.[0];
    console.log({ fileInput, file });
  });
  const uploaded = await uploadFiles(fileInputs);
  displayStatus(JSON.parse(uploaded));
});

form.addEventListener("dragover", function (event) {
  event.preventDefault();
});

form.addEventListener("drop", function (event) {
  event.preventDefault();
  if (event.dataTransfer.files.length) {
    uploadFile(event.dataTransfer.files[0]);
  }
});

const getOutput = (forInput) => {
  switch (forInput) {
    case "file":
      return firstOutputBox;
    default:
      return compareOutputBox;
  }
};

// Loop through the nodelist of inputs to create event listeners
fileInputs.forEach((fileInput) => {
  fileInput.addEventListener("change", function (e) {
    const file = fileInput.files?.[0];
    console.log(e.target);
    const forInput = e.target.getAttribute("name");
    console.log({ forInput });

    const output = getOutput(forInput);
    console.log({ output });

    if (file) {
      displayFileData(file, output);
    } else {
      firstOutputBox.textContent = "No file selected";
    }
  });
});

// Loop through the nodelist of inputs to create event listeners
labels.forEach((label) => {
  label.addEventListener("click", function (event) {
    // Use closest incase of selecting "browse" or the icon
    const forInput = event.target.closest("label").nextElementSibling;
    forInput.click();
  });
});
