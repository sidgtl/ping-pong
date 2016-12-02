
from trueskill import Rating, rate, quality
import sqlalchemy as sqla

#config
db = 'mga_pingpong'
host = 'plista680.plista.com'
user = 'pingpong'
password = 'flib2AXChEgoUxrxEaf28'
port = '3306'

#exemplary calls:
#submitMatchResult(team1 = "2,3", team2="1,4", winningTeam=1)
#matchQuality(team1 = "2,3", team2="1,4")

def getRating(playerId):
    r = exe_my_sql_query("SELECT trueSkill_mu,trueSkill_sigma FROM players WHERE id = '"+str(playerId)+"'").fetchone()
    rating = Rating(mu=r["trueSkill_mu"], sigma=r["trueSkill_sigma"])
    return(rating)

def updateRating(playerId,rating):
    statement = "UPDATE players SET trueSkill_mu = '"+str(rating.mu)+"', trueSkill_sigma = '"+str(rating.sigma)+"' WHERE id = '"+str(playerId)+"'"
    print(statement)
    exe_my_sql_query(statement)
    return

def getTeamRatings(team):
    team_ratings = []
    for player in team:
        r = getRating(player)
        team_ratings.append(r)
    return team_ratings

def setTeamRatings(team, ratings):
    if(len(team)==len(ratings)):
        for i in range(0,len(team)):
            updateRating(playerId = team[i],rating = ratings[i])
    return

#expecting a comma separated string of playerids for each team parameter
def submitMatchResult(team1,team2,winningTeam):
    #get rating of all players
    t1 = team1.split(",")
    t2 = team2.split(",")

    t1_ratings = getTeamRatings(t1)
    t2_ratings = getTeamRatings(t2)

    #update rating using results of this match
    if(winningTeam==1):
        matchResult=[0,1]
    else:
        matchResult=[1,0]
    t1_updated, t2_updated = rate([t1_ratings, t2_ratings], ranks=matchResult)

    #write back to db
    setTeamRatings(t1, t1_updated)
    setTeamRatings(t2, t2_updated)
    return

def exe_my_sql_query(query, host = host, db = db,port=port):
    path = "mysql://"+user+':'+password+'@'+host+'/'+db+'?host='+host+'?port='+port
    engine = sqla.create_engine(path)
    connection = engine.connect()
    result = connection.execute(query)
    connection.close()
    #return json.dumps([dict(r) for r in result])
    return result

def matchQuality(team1,team2):
    # get rating of all players
    t1 = team1.split(",")
    t2 = team2.split(",")

    t1_ratings = getTeamRatings(t1)
    t2_ratings = getTeamRatings(t2)

    q = quality([t1_ratings, t2_ratings])
    return round(q,4)

#exemplary call:
#submitMatchResult(team1 = "3", team2="1", winningTeam=1)
#matchQuality(team1="1",team2="3")

