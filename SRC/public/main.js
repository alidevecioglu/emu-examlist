var courses = [];

function handleUpdate() {
  TableUpdate();
  generateAddToCalendarLink();
  generateSubscribeIOS();
}

function addCourse() {
  var courseCode = document
    .getElementById("courseCode")
    .value.trim()
    .toUpperCase()
    .replace(/\s/g, "");
  if (courseCode) {
    var courseCodes = courseCode.split(",");
    fetch(`/api/getCourse/${courseCode}`)
      .then((response) => response.json())
      .then((data) => {
        if (data.error) {
          alert(data.error);
        } else {
          data.forEach((course) => {
            var courseIndex = courses.findIndex(
              (c) => c.course === course.course
            );
            if (courseIndex === -1) {
              courses.push(course);
            }
          });
          handleUpdate();
        }
      });
  }
  document.getElementById("courseCode").value = "";
}

function removeCourse(courseCode) {
  var courseIndex = courses.findIndex((c) => c.course === courseCode);
  if (courseIndex !== -1) {
    courses.splice(courseIndex, 1);
    handleUpdate();
  }
}

function generateRemoveButton(courseCode) {
  var button = document.createElement("button");
  button.className = "btn btn-danger";
  button.onclick = function () {
    removeCourse(courseCode);
  };

  var icon = document.createElement("img");
  icon.src = "trash.svg";
  icon.alt = "Remove";
  icon.style.width = "16px";
  icon.style.height = "16px";
  icon.style.filter = "invert(100%)";

  button.appendChild(icon);

  return button;
}

function TableUpdate() {
  var table = document
    .getElementById("ExamTable")
    .getElementsByTagName("tbody")[0];
  table.innerHTML = "";
  courses.sort((a, b) => new Date(a.ParsedDate) - new Date(b.ParsedDate));
  courses.forEach((course) => {
    var row = table.insertRow(-1);
    var courseCell = row.insertCell(0);
    var nameCell = row.insertCell(1);
    var dateCell = row.insertCell(2);
    var periodCell = row.insertCell(3);
    var actionCell = row.insertCell(4);
    courseCell.innerHTML = course.course;
    nameCell.innerHTML = course.name;
    dateCell.innerHTML = course.date;
    periodCell.innerHTML = course.period;
    actionCell.appendChild(generateRemoveButton(course.course));
  });
}

function generateAddToCalendarLink() {
  var courseCodes = courses.map((c) => c.course).join(",");
  var url = courseCodes.length > 0 ? `/cal/${courseCodes}` : "#";
  document.getElementById("generatedURL").href = url;
}

function generateSubscribeIOS() {
  var baseURL = "webcal://";
  var courseCodes = courses.map((c) => c.course).join(",");
  var url =
    courseCodes.length > 0
      ? `${baseURL}${window.location.hostname}/cal/${courseCodes}`
      : "#";
  document.getElementById("subscribeURL").href = url;
}

function clearAll() {
  courses = [];
  handleUpdate();
}
