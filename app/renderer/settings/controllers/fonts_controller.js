import { Controller } from 'stimulus';
import fontList from 'font-list';

export default class extends Controller {
  connect() {
    fontList.getFonts()
      .then(fonts => {
        let options = "";
        fonts.forEach(font => {
          font = font.replace(/"/g,"");
          options += `<option value="${font}">${font}</option>`;
        });
        this.element.querySelector('select').innerHTML = options;

        const currentValue = currentProfile.get(this.element.querySelector('select').name)
        const element = this.element.querySelector(`option[value='${currentValue}']`)

        if (element) {
          element.selected = true
        }
      })
      .catch(err => console.log(err));
  }
}
