/* global describe, it */

const {assert} = require('chai')
const Tab = require('../../app/sessions/tab')

describe('Tab', () => {
  describe('add', () => {
    it('adds a new session by branching when root is a session', () => {
      const tab = new Tab()
      tab.add(null, 'vertical')

      assert.equal(tab.root.constructor.name, 'Branch')
      assert.isDefined(tab.root.left)
      assert.isDefined(tab.root.right)
    })

    it('adds a new session by branching when root is a branch', () => {
      const tab = new Tab()
      const leftSession = tab.add(null, 'vertical').left.id
      const newGroup = tab.add(leftSession, 'horizontal')

      assert.equal(tab.root.constructor.name, 'Branch')
      assert.equal(tab.root.right.constructor.name, 'Session')
      assert.equal(newGroup, tab.root.left)
      assert.equal(newGroup.constructor.name, 'Branch')
      assert.equal(newGroup.left.id, leftSession)
      assert.equal(newGroup.right.constructor.name, 'Session')
    })
  })

  describe('remove', () => {
    it('removes the root session', () => {
      const tab = new Tab()
      const sessionToRemove = tab.root.id

      tab.remove(sessionToRemove)

      assert.isNull(tab.root)
    })

    describe('left', () => {
      it('removes a 1 level branch session and replaces root with a session', () => {
        const tab = new Tab()
        tab.add(null, 'vertical')

        const sessionToRemove = tab.root.left.id
        const sessionToSave = tab.root.right

        assert.equal(tab.root.constructor.name, 'Branch')
        tab.remove(sessionToRemove)

        assert.equal(tab.root.constructor.name, 'Session')
        assert.equal(tab.root, sessionToSave)
        assert.isNull(tab.root.branch)
      })

      it('removes a >1 level branch session', () => {
        const tab = new Tab()
        const newBranch = tab.add(tab.add(null, 'vertical').left.id, 'vertical')

        const sessionToRemove = newBranch.left.id
        const sessionToSave = newBranch.right

        tab.remove(sessionToRemove)

        assert.equal(sessionToSave, tab.root.left)
        assert.equal(sessionToSave.branch, tab.root)
      })
    })

    describe('right', () => {
      it('removes a 1 level branch session and replaces root with a session', () => {
        const tab = new Tab()
        tab.add(null, 'vertical')

        const sessionToRemove = tab.root.right.id
        const sessionToSave = tab.root.left

        assert.equal(tab.root.constructor.name, 'Branch')
        tab.remove(sessionToRemove)

        assert.equal(tab.root.constructor.name, 'Session')
        assert.equal(tab.root, sessionToSave)
        assert.isNull(tab.root.branch)
      })

      it('removes a >1 level branch session', () => {
        const tab = new Tab()
        const newBranch = tab.add(tab.add(null, 'vertical').right.id, 'vertical')

        const sessionToRemove = newBranch.right.id
        const sessionToSave = newBranch.left

        tab.remove(sessionToRemove)

        assert.equal(sessionToSave, tab.root.right)
        assert.equal(sessionToSave.branch, tab.root)
      })
    })
  })

  describe('find', () => {
    it('returns a deeply nested session', () => {
      const tab = new Tab()
      const newBranch = tab.add(tab.add(null, 'vertical').right.id, 'vertical')

      const foundSession = tab.find(tab.root, newBranch.left.id)

      assert.equal(foundSession, tab.root.right.left)
    })
  })
})
