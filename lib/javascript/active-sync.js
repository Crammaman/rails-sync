import Model from './model.js'
import CamelCase from 'camelcase'
import Pluralize from 'pluralize'

export default class ActiveSync {

  static models = []

  // ActiveSync dynamically creates model classes when a new instance of it is created
  // Valid arguments are:
  // models:  Used to define custom model. Pass an array of classes in and they will be set up as ActiveSync models.
  //          It's expected that models passed in extends ActiveSyncs Model class. They will then receive extra functions
  //          as per anything defined in the modelDescriptions argument
  //
  // modelDescriptions: An object that describes all the models for ActiveSync to create. If the model is not defined in
  //                    the model then an empty model is created. Then all the described associations are added to their
  //                    respective models.
  //                    IE { Customer: { hasMany: ['sites']}, Site: { belongsTo: 'customer' }
  //                    Will add a 'sites' method to the Customer class and a 'customer' method to Site.
  //



  constructor( args ){
    this._models = args.models || [];
    this.buildModels(args.modelDescriptions)
  }

  install( vue ){
    this._models.forEach((model)=> vue.prototype["$" + model.className] = model)
  }

  models(){
    return this._models
  }

  // Creates the models from the modelDescription arg passed int to the constructor
  buildModels(modelDescriptions){
    let modelNames = Object.keys(modelDescriptions || {});

    modelNames.forEach((modelName) => {
      if(!this._models.find((model) => model.className === modelName)){
        this._models.push(this.createModel(modelName))
      }
    })

    this._models.forEach((model) => {
      ((modelDescriptions[model.className] || {}).belongsTo || []).forEach((association) => {
        let associatedModel = this._models.find((model) => model.className === CamelCase(association, {pascalCase: true}))
        model[association] = function () {
          return associatedModel.find(this[association + 'Id'])
        }
      });

      ((modelDescriptions[model.className] || {}).hasMany || []).forEach((association) => {
        let associatedModel = this._models.find((model) => model.className === CamelCase(Pluralize.singular(association), {pascalCase: true}))
        model.prototype[association] = function () {
          let associationQuery = {}
          associationQuery[CamelCase(model.className) + 'Id'] = this.id
          return associatedModel.where(associationQuery)
        }
      });
    })
  }

  createModel(name){
    let modelClass = Model
    return eval(`(class ${name} extends modelClass { static className = '${name}' })`)
  }
}



// Code for dynamically requesting Model names and associations.
//
// Object.keys( modelDescriptions ).forEach( ( modelName ) =>{
//   modelDescriptions[modelName].name = modelName
//   this.setupModel( modelDescriptions[modelName] )
// })

// var modelDescriptions = this.requestModelDescriptions()
// this._models.forEach( ( model ) => model.setAssociatedModels( this._models))
// args.afterSetup( this._models )
// requestModelDescriptions(){
//   var xmlHttp = new XMLHttpRequest()
//   xmlHttp.open( "GET", 'active_sync/models', false ) // false for synchronous request
//   xmlHttp.send( null )
//   return JSON.parse(xmlHttp.responseText)
// }