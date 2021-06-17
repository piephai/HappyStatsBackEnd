/*[How to validate date in yyyy-mm-dd format taking into consideration leap year](https://stackoverflow.com/questions/18758772/how-do-i-validate-a-date-in-this-format-yyyy-mm-dd-using-jquery/18758944)*/
const isValidDate = (dateString) => {
    const regEx = /^\d{4}-\d{2}-\d{2}$/;
    if(!dateString.match(regEx)) return false;  // Invalid format
    const d = new Date(dateString);
    const dNum = d.getTime();
    if(!dNum && dNum !== 0) return false; // NaN value, Invalid date
    return d.toISOString().slice(0,10) === dateString;
  }

/* Check if the date is from the past */
const isDateInThePast = (dateString) => {
  let todayDate = new Date(Date.now()); //Get the current date
  const dateInput = new Date(dateString);
  if (dateInput.setHours(0, 0, 0, 0) <= todayDate.setHours(0, 0, 0, 0)) {
    return true;
  }

  return false;
}

 module.exports = {isValidDate, isDateInThePast};
  