const rulerHooks = () => {
	const originalMoveTokenHandler = Ruler.prototype.moveToken;
	Ruler.prototype.moveToken = function (event) {
		const eventHandled = onRulerMoveToken.call(this, event);
		if (!eventHandled)
			return originalMoveTokenHandler.call(this, event);
		return true;
	}

	const originalToJSON = Ruler.prototype.toJSON;
	Ruler.prototype.toJSON = function () {
		const json = originalToJSON.call(this);
		if (this.draggedToken)
			json["draggedToken"] = this.draggedToken.data._id;
		return json
	}

	const originalUpdate = Ruler.prototype.update;
	Ruler.prototype.update = function (data) {
		// Don't show a GMs drag ruler to non GM players
		if (data.draggedToken && this.user.isGM && !game.user.isGM && !game.settings.get(settingsKey, "showGMRulerToPlayers"))
			return;
		if (data.draggedToken) {
			this.draggedToken = canvas.tokens.get(data.draggedToken);
		}
		originalUpdate.call(this, data);
	}

	const originalMeasure = Ruler.prototype.measure;
	Ruler.prototype.measure = function (destination, options = {}) {
		if (this.isDragRuler) {
			return measure.call(this, destination, options);
		}
		else {
			return originalMeasure.call(this, destination, options);
		}
	}

	const originalEndMeasurement = Ruler.prototype._endMeasurement;
	Ruler.prototype._endMeasurement = function () {
		originalEndMeasurement.call(this);
		this.draggedToken = null;
	}
};

export default rulerHooks;