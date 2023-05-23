import { Grid, TextField } from '@mui/material'
import {
  MessagesViewerPaginationBarContainer,
  MessagesViewerPaginationTextField,
  MessagesViewerRoot
} from './styled'
import React, { useCallback, useEffect, useState } from 'react'

import Box from '@mui/material/Box'
import Drawer from '@mui/material/Drawer'
import Button from '@mui/material/Button'
import MessageItem from './MessageItem/MessageItem'
import Pagination from '@mui/material/Pagination'
import SearchIcon from '@mui/icons-material/Search'
import Toolbar from '@mui/material/Toolbar'
import commonConfig from '../../config/commonConfig'
import { useParams } from 'react-router-dom'

function FilterDrawerToggleButton (props) {
  let {
    rightVal = 0,
    handleToggleFilterDrawer = () => {},
    positionVal = 'absolute'
  } = props
  return (
    <Button
      variant='contained'
      onClick={handleToggleFilterDrawer}
      sx={{
        position: positionVal,
        top: '30%',
        right: rightVal,
        height: 64,
        width: 64
      }}
    >
      <SearchIcon />
    </Button>
  )
}

function MessagesViewer (props) {
  const { userId } = useParams()
  const { drawerWidth, itemsPerPage: itemsPerPageConfig } = commonConfig
  const [selectedPage, setSelectedPage] = useState(1)
  const [itemsPerPage] = useState(itemsPerPageConfig)
  const [conversationData, setConversationData] = useState({})
  const [totalPageCount, setTotalPageCount] = useState(1)
  const [isFilterDrawerOpenFlag, setIsFilterDrawerOpenFlag] = useState(true)
  const [searchText, setSearchText] = React.useState('')
  const [searchResults, setSearchResults] = React.useState([])

  let getMessageData = useCallback(async () => {
    let allConversationsArray = []
    let areAllFilesReadFlag = false
    try {
      let index = 1
      while (!areAllFilesReadFlag) {
        const importedConversationFileData =
          await require(`../../message-data/${userId}/message_${index}.json`)
        if (!importedConversationFileData) break
        allConversationsArray.push(importedConversationFileData)
        index++
      }
    } catch (error) {
      areAllFilesReadFlag = true
    }

    let finalConversationObject = allConversationsArray.reduce(
      (accumulatedData, currentData, index) => {
        let finalData
        if (!accumulatedData) {
          finalData = currentData
        } else {
          finalData = {
            ...accumulatedData,
            messages: [...accumulatedData.messages, ...currentData.messages]
          }
        }
        return finalData
      }
    )

    finalConversationObject.messages =
      finalConversationObject.messages.toReversed()

    console.log('finalConversationObject', finalConversationObject)
    setTotalPageCount(
      Math.ceil(finalConversationObject?.messages?.length / itemsPerPage)
    )
    setConversationData(finalConversationObject)
  }, [userId, itemsPerPage])

  useEffect(() => {
    getMessageData()
  }, [getMessageData])

  const handlePaginationTextChange = event => {
    setSelectedPage(event.target.value)
  }

  const handleSetSearchText = event => {
    setSearchText(event.target.value)
  }

  const handlePaginationSelectorChange = (event, value) => {
    setSelectedPage(value)
  }

  const handleToggleFilterDrawer = () => {
    setIsFilterDrawerOpenFlag(!isFilterDrawerOpenFlag)
  }

  const handleFilterDrawerClose = () => {
    setIsFilterDrawerOpenFlag(false)
  }

  const pageStartMessageIndex = (selectedPage - 1) * itemsPerPage
  const pageEndMessageIndex = pageStartMessageIndex + itemsPerPage

  return (
    <MessagesViewerRoot>
      <Grid
        container
        direction='column'
        justifyContent='flex-start'
        alignItems='flex-start'
        spacing={{ xs: 2, md: 3 }}
      >
        {conversationData?.messages
          ?.slice(pageStartMessageIndex, pageEndMessageIndex)
          .map(messageData => {
            return (
              <MessageItem
                conversationData={conversationData}
                messageData={messageData}
                key={messageData.timestamp_ms}
              />
            )
          })}
      </Grid>

      {totalPageCount > 1 && (
        <MessagesViewerPaginationBarContainer>
          <Pagination
            showFirstButton
            showLastButton
            count={totalPageCount}
            color='primary'
            size='large'
            shape='rounded'
            variant='outlined'
            name='pagination-selector'
            page={selectedPage}
            onChange={handlePaginationSelectorChange}
          />
          <MessagesViewerPaginationTextField
            type='number'
            label='Page'
            id='outlined-size-small'
            size='small'
            name='pagination-text-input'
            value={selectedPage}
            onChange={handlePaginationTextChange}
            sx={{ minWidth: `${totalPageCount.toString().length}ch` }}
          />
        </MessagesViewerPaginationBarContainer>
      )}

      <Drawer
        anchor={'right'}
        open={isFilterDrawerOpenFlag}
        onClose={handleFilterDrawerClose}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: 'border-box'
          },
          position: 'relative',
          ['.MuiDrawer-paperAnchorRight']: {
            overflow: 'visible'
          }
        }}
      >
        <Toolbar variant='dense' disableGutters />
        <Box sx={{ overflow: 'auto', padding: 2 }}>
          <TextField
            type='text'
            label='Search'
            value={searchText}
            onChange={handleSetSearchText}
          />
        </Box>

        <FilterDrawerToggleButton
          rightVal={'100%'}
          handleToggleFilterDrawer={handleToggleFilterDrawer}
        />
      </Drawer>

      <FilterDrawerToggleButton
        rightVal={0}
        positionVal={'fixed'}
        handleToggleFilterDrawer={handleToggleFilterDrawer}
      />
    </MessagesViewerRoot>
  )
}

MessagesViewer.propTypes = {}

export default MessagesViewer
