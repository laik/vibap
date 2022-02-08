import {observer} from 'mobx-react';
import React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Box from '@mui/material/Box';

interface BoothProps {
  title: React.ReactNode;
  content: React.ReactNode;
  extraContent?: React.ReactNode;
  extra?: React.ReactNode;
}

// 展台
@observer
export class TopBooth extends React.Component<BoothProps> {
  render() {
    const {title, extra, content, extraContent} = this.props;
    return (
      <Card variant='outlined' sx={{m: 1}}>
        <CardContent>
          <Box sx={{display: 'flex', mb: 2}}>
            {title}
            {extra && (
              <Box sx={{display: 'flex', flex: 2, justifyContent: 'flex-end'}}>
                {extra}
              </Box>
            )}
          </Box>
          {content || extraContent ? (
            <Box sx={{display: 'flex', width: '100%'}}>
              {content && (
                <Box sx={{flex: 'auto', width: '100%'}}>{content}</Box>
              )}
              {extraContent && (
                <Box
                  sx={{
                    textAlign: 'right',
                    flex: '0 1 auto',
                    ml: 2,
                    minWidth: '242px',
                  }}
                >
                  {extraContent}
                </Box>
              )}
            </Box>
          ) : null}
        </CardContent>
      </Card>
    );
  }
}