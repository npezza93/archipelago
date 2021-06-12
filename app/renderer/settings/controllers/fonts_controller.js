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
      })
      .catch(err => console.log(err));
  }
}
