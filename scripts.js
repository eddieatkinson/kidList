$(document).ready(() => {
  console.log('Linked!');
  // $("#count").change(() => {
  //   console.log($("#count").val());
  // });
  let count;
  $("#count").blur(() => {
    count = $("#count").val();
    // console.log(count);
  });
  $("#submit").click(() => {
    if (count) {
      console.log(count);
    } else {
      console.log('Number needed!');
    }
  });
});