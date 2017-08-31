stage.loadFile('data://1blu.pdb').then(function (o) {
  o.addRepresentation('line+cross', {
    pickable: true,
    crossAll: false,
    crossSize: 0.2
  })

  o.autoView()
})
