React    = require 'react'
Property = require './property'

module.exports =
class PropertiesSection extends React.Component
  render: ->
    React.createElement(
      'archipelago-properties-section'
      ref: @props.innerRef
      for group, properties of @groupedProperties()
        @groupOfProperties(properties).concat(@seperator(group))
    )

  groupOfProperties: (properties) ->
    for property in properties
      for name, schema of property
        React.createElement(
          Property, key: name, property: name, schema: schema
        )

  seperator: (groupNumber) ->
    React.createElement('div', key: groupNumber, className: 'seperator')

  groupedProperties: ->
    properties = {}

    for property, schema of Object.assign(...@props.properties)
      properties[schema.settings.group] ?= []
      properties[schema.settings.group].push("#{property}": schema)

    properties
