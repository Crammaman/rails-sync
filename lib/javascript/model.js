import Axios from 'axios'
import SnakeCase from 'snake-case'
import Pluralize from 'pluralize'
import CamelCase from 'camelcase'

import Util from 'util'

export default class Model {

  // static records = {}
  static recordsLoaded = false
  static url_path_base = 'active_sync/'

  constructor(args){
    if(!args.id) throw 'Can not create record without an id'
    if(this.constructor.records[args.id]){
      this.constructor.records[args.id].setProperties(args)
    } else {
      this.setProperties(args)
      this.constructor.records[this.id] = this
    }
  }

  setProperties(args){
    Object.keys(args).forEach((property)=>{
      this[CamelCase(property)] = args[property]
    })
  }

  static get records(){
    if(!this.recordsObject) this.recordsObject = {}
    return this.recordsObject
  }

  static get all(){
    return new Promise((resolve,reject)=>{
      if(this.recordsLoaded){
        resolve(Object.keys(this.records).map((id) => this.records[id]))
      } else {
        return this.loadRecords().then(()=>{
          resolve(Object.keys(this.records).map((id) => this.records[id]))
        })
      }
    })
  }

  static find(id){
    return new Promise((resolve,reject)=>{
      if(!this.records[id]){
        resolve(this.loadRecords(id).then(()=> this.records[id]))
      } else {
        resolve(this.records[id])
      }
    })
  }

  static where(args){
    return new Promise((resolve,reject)=>{
      if(this.recordsLoaded){
        resolve(this.searchRecords(args))
      } else {
        this.loadRecords(args).then(() => resolve(this.searchRecords(args)))
      }
    })
  }

  static through(model, args){
    return model.loadRecords(args).then(()=>{
      var linkingIds = [...new Set(model.searchRecords(args).map((record)=> record[CamelCase(this.className)+'Id']))]
      return this.where({id: linkingIds})
    })
  }

  static create(data){
    return Axios.post( `${this.url_path_base}${Pluralize(SnakeCase(this.className))}`, Util.snakeCaseKeys(data))
        .then((response) => {
          new this(response.data)
          return response
        })
  }

  static update(data){
    return Axios.put( `${this.url_path_base}${Pluralize(SnakeCase(this.className))}/${data.id}`, Util.snakeCaseKeys(data))
        .then((response) => {
          new this(response.data)
          return response
        })
  }

  //Intended as private below here
  static loadRecords(args = undefined){
    //No args is interpretted as load all.
    const PathBase = `${this.url_path_base}${Pluralize(SnakeCase(this.className))}`
    switch(typeof args){
      case 'undefined':
        return Axios.get( PathBase )
            .then((response) => {
              response.data.forEach((record)=> {
                new this(record)
              })
              this.recordsLoaded = true
            })
            .catch((error) => {
              console.log(error)
            })
      case 'number':
        return Axios.get(  PathBase + '/' + args )
            .then((response) => {
              new this(response.data)
            })
            .catch((error) => {
              console.log(error)
            })
      case 'object':
        return Axios.post( PathBase + '/search', Util.snakeCaseKeys(args) )
            .then((response) => {
              response.data.forEach((record)=> {
                new this(record)
              })
            })
            .catch((error) => {
              console.log(error)
            })
    }
  }

  static searchRecords(args){
    var results = []
    Object.keys(this.records).forEach((id)=>{
      // Its a match if none of the keys don't match (IE terminates when a property doesn't match), if a property is an array it still matches if the corresponding arg is within it.
      var match = !Object.keys(args).some((arg)=> {
        return !(this.records[id][arg] == args[arg] ||
            (Array.isArray(this.records[id][arg]) && this.records[id][arg].some((i)=> typeof i == 'object' && i.id == args[arg])) ||
            (Array.isArray(args[arg]) && args[arg].some((a)=> typeof a == 'object' && a.id == this.records[id][arg] || a == this.records[id][arg]))
        )
      })
      if(match) results.push(this.records[id])
    })
    return results
  }
}