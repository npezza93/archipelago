/* global describe, it, beforeEach, afterEach */

const {assert} = require('chai')

const {pref} = require('../../app/configuration/config-file')
const Tab = require('../../app/sessions/tab')

describe('Tab', () => {
  beforeEach(() => {
    this.pref = pref()
    this.pref.store = {activeProfileId: 1, profiles: [{id: 1, theme: {}}]}
    this.tab = new Tab(this.pref)
  })

  afterEach(() => {
    this.tab.kill()
    this.pref.dispose()
    this.pref.clear()
  })

  describe('add', () => {
    it('adds a new session by branching when root is a session', () => {
      this.tab.add(null, 'vertical')

      assert.equal(this.tab.root.constructor.name, 'Branch')
      assert.isDefined(this.tab.root.left)
      assert.isDefined(this.tab.root.right)
    })

    it('adds a new session by branching when root is a branch', () => {
      const leftSession = this.tab.add(null, 'vertical').left.id
      const newGroup = this.tab.add(leftSession, 'horizontal')

      assert.equal(this.tab.root.constructor.name, 'Branch')
      assert.equal(this.tab.root.right.constructor.name, 'Session')
      assert.equal(newGroup, this.tab.root.left)
      assert.equal(newGroup.constructor.name, 'Branch')
      assert.equal(newGroup.left.id, leftSession)
      assert.equal(newGroup.right.constructor.name, 'Session')
    })
  })

  describe('remove', () => {
    it('removes the root session', () => {
      const sessionToRemove = this.tab.root.id

      this.tab.remove(sessionToRemove)

      assert.isNull(this.tab.root)
    })

    describe('left', () => {
      it('removes a 1 level branch session and replaces root with a session', () => {
        this.tab.add(null, 'vertical')

        const sessionToRemove = this.tab.root.left.id
        const sessionToSave = this.tab.root.right

        assert.equal(this.tab.root.constructor.name, 'Branch')
        this.tab.remove(sessionToRemove)

        assert.equal(this.tab.root.constructor.name, 'Session')
        assert.equal(this.tab.root, sessionToSave)
        assert.isNull(this.tab.root.branch)
      })

      it('removes a >1 level branch session', () => {
        const newBranch = this.tab.add(this.tab.add(null, 'vertical').left.id, 'vertical')

        const sessionToRemove = newBranch.left.id
        const sessionToSave = newBranch.right

        this.tab.remove(sessionToRemove)

        assert.equal(sessionToSave, this.tab.root.left)
        assert.equal(sessionToSave.branch, this.tab.root)
      })
    })

    describe('right', () => {
      it('removes a 1 level branch session and replaces root with a session', () => {
        this.tab.add(null, 'vertical')

        const sessionToRemove = this.tab.root.right.id
        const sessionToSave = this.tab.root.left

        assert.equal(this.tab.root.constructor.name, 'Branch')
        this.tab.remove(sessionToRemove)

        assert.equal(this.tab.root.constructor.name, 'Session')
        assert.equal(this.tab.root, sessionToSave)
        assert.isNull(this.tab.root.branch)
      })

      it('removes a >1 level branch session', () => {
        const newBranch = this.tab.add(this.tab.add(null, 'vertical').right.id, 'vertical')

        const sessionToRemove = newBranch.right.id
        const sessionToSave = newBranch.left

        this.tab.remove(sessionToRemove)

        assert.equal(sessionToSave, this.tab.root.right)
        assert.equal(sessionToSave.branch, this.tab.root)
      })
    })
  })

  describe('find', () => {
    it('returns a deeply nested session', () => {
      const newBranch = this.tab.add(this.tab.add(null, 'vertical').right.id, 'vertical')

      const foundSession = this.tab.find(this.tab.root, newBranch.left.id)

      assert.equal(foundSession, this.tab.root.right.left)
    })
  })
})
