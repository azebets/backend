const express = require('express')
const router = express.Router()
const requireAuth = require('../../../middleware/requireAuth')
const game = require('../../../games/crash.controllers');

router.post('/scripts/list', game.handleScriptList)
router.get('/history', game.handleCrashHistory)
router.get('/details/:betID', game.handleBetDetails)
router.get('/players/:gameID', game.handleCrashGamePlayers)
router.post('/verify', game.verify)

//Test
router.post('/generate-hash', game.resetCrashDB)

// auth middleware
router.post('/my-bet', requireAuth, game.handleMybets);
router.post('/scripts/add', requireAuth, game.handleScriptAddOrUpdate)
router.post('/scripts/update', requireAuth, game.handleScriptAddOrUpdate)
router.post('/scripts/delete', requireAuth, game.handleScriptDelete)

module.exports = router