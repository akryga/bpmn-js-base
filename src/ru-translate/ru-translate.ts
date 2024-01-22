import translations from './ru';

const ruTranslateModule: any = {
  translate: [ 'value', (template: string, replacements: any) => {
    replacements = replacements || {};
  
    // Translate
    template = (<any>translations)[template] || template;
  
    // Replace
    return template.replace(/{([^}]+)}/g, function(_, key) {
      return replacements[key] || '{' + key + '}';
    });
  } ]
}

export default ruTranslateModule;
